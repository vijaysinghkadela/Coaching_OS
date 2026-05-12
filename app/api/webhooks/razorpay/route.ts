import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  // Verify HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '')
    .update(body)
    .digest('hex')

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const { event: eventType, payload } = event

  if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
    const sub = payload.subscription?.entity
    if (sub) {
      await supabase
        .from('saas_subscriptions')
        .update({
          status: 'active',
          current_period_end: new Date(sub.current_end * 1000).toISOString(),
          razorpay_subscription_id: sub.id,
        })
        .eq('razorpay_subscription_id', sub.id)
    }
  }

  if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
    const sub = payload.subscription?.entity
    if (sub) {
      await supabase
        .from('saas_subscriptions')
        .update({ status: 'cancelled' })
        .eq('razorpay_subscription_id', sub.id)

      // Downgrade to starter
      const { data: subscription } = await supabase
        .from('saas_subscriptions')
        .select('institute_id')
        .eq('razorpay_subscription_id', sub.id)
        .single()

      if (subscription) {
        await supabase
          .from('institutes')
          .update({ plan_tier: 'starter' })
          .eq('id', subscription.institute_id)
      }
    }
  }

  if (eventType === 'payment.captured') {
    const payment = payload.payment?.entity
    if (payment?.notes?.fee_record_id) {
      await supabase.from('payment_transactions').insert({
        institute_id: payment.notes.institute_id,
        fee_record_id: payment.notes.fee_record_id,
        amount: payment.amount / 100,
        payment_method: 'razorpay',
        status: 'completed',
        reference_number: payment.id,
        payment_date: new Date(payment.created_at * 1000).toISOString(),
      })
    }
  }

  return NextResponse.json({ received: true })
}
