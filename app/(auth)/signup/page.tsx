'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { TIER_LIMITS } from '@/lib/constants'

const signupSchema = z.object({
  full_name:      z.string().min(2, 'Your name is required'),
  email:          z.string().email('Enter a valid email'),
  password:       z.string().min(8, 'Password must be at least 8 characters'),
  institute_name: z.string().min(2, 'Institute name is required'),
  city:           z.string().min(2, 'City is required'),
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
      resolver: zodResolver(signupSchema),
      defaultValues: {},
    })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    const supabase = createClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, global_role: 'owner' },
      },
    })

    if (error || !authData.user) {
      toast.error(error?.message ?? 'Sign up failed')
      setLoading(false)
      return
    }

     // Create institute - default to starter plan since we removed tier selection
     const { error: instError } = await supabase.from('institutes').insert({
       owner_id:     authData.user.id,
       name:         data.institute_name,
       city:         data.city,
       plan_tier:    'starter',
       max_students: TIER_LIMITS.starter.maxStudents,
     })

    if (instError) {
      toast.error('Account created but institute setup failed. Contact support.')
      setLoading(false)
      return
    }

    toast.success('Institute registered! Setting up your dashboard…')
    router.push('/onboarding')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register your institute</CardTitle>
        <CardDescription>Set up Coaching OS for your coaching center in 2 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Your Name</Label>
              <Input id="full_name" placeholder="Rajesh Sharma" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Bikaner" {...register('city')} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="institute_name">Institute Name</Label>
            <Input id="institute_name" placeholder="ABC Coaching Centre" {...register('institute_name')} />
            {errors.institute_name && <p className="text-xs text-destructive">{errors.institute_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="director@abc-coaching.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>



          <p className="text-xs text-muted-foreground">
            14-day free trial. No credit card required.
          </p>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Institute Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
