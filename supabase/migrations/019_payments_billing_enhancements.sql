-- ============================================================================
-- Coaching OS — Migration 019: Payments and Billing Enhancements
-- ============================================================================

-- Create payment_methods table for storing user payment information
CREATE TABLE IF NOT EXISTS payment_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  payment_type    TEXT NOT NULL CHECK (payment_type IN ('card', 'upi', 'wallet', 'bank_account')),
  provider        TEXT NOT NULL, -- e.g., 'stripe', 'razorpay', 'paytm', 'phonepe', 'gpay'
  token           TEXT NOT NULL, -- secure token/reference to actual payment method
  last_four       TEXT, -- last 4 digits for cards, UPI ID for UPI, etc.
  brand           TEXT, -- card brand (visa, mastercard, etc.) or wallet name
  expiry_month    INTEGER, -- for cards
  expiry_year     INTEGER, -- for cards
  is_default      BOOLEAN DEFAULT false,
  is_verified     BOOLEAN DEFAULT false,
  billing_address JSONB, -- billing address associated with this method
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, payment_type, provider, token)
);

-- Create invoices table for detailed billing documents
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL,
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')) DEFAULT 'draft',
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate        DECIMAL(5,2) DEFAULT 0, -- percentage
  tax_amount      DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid     DECIMAL(10,2) DEFAULT 0,
  amount_due      DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_id      UUID REFERENCES saas_subscriptions(id) ON DELETE SET NULL, -- link to subscription if applicable
  notes           TEXT,
  terms_and_conditions TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoice_items table for line items on invoices
CREATE TABLE IF NOT EXISTS invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        DECIMAL(8,2) NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price     DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  tax_included    BOOLEAN DEFAULT false,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  hsn_code        TEXT, -- for GST compliance in India
  sac_code        TEXT, -- for service accounting codes
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table for tracking individual payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES saas_subscriptions(id) ON DELETE SET NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('card', 'upi', 'wallet', 'bank_account', 'cash')),
  provider        TEXT NOT NULL, -- e.g., 'stripe', 'razorpay'
  transaction_id  TEXT NOT NULL, -- gateway transaction ID
  gateway_response JSONB, -- full response from payment gateway
  status          TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled')) DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  refunded_at     TIMESTAMPTZ,
  refund_amount   DECIMAL(10,2) DEFAULT 0,
  refund_reason   TEXT,
  fees_charged    DECIMAL(10,2) DEFAULT 0, -- payment gateway fees
  net_amount      DECIMAL(10,2), -- amount received after fees
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_plans table for installment payment options
CREATE TABLE IF NOT EXISTS payment_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  total_amount    DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'INR',
  installment_count INTEGER NOT NULL CHECK (installment_count > 0),
  installment_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount / installment_count) STORED,
  interval        TEXT NOT NULL CHECK (interval IN ('weekly', 'biweekly', 'monthly')),
  start_date      DATE,
  end_date        DATE,
  grace_period_days INTEGER DEFAULT 3,
  late_fee_percent DECIMAL(5,2) DEFAULT 5,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_plan_enrollments table for tracking who's on payment plans
CREATE TABLE IF NOT EXISTS payment_plan_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE,
  status          TEXT NOT NULL CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled', 'paused')) DEFAULT 'active',
  installments_paid INTEGER DEFAULT 0,
  total_paid      DECIMAL(10,2) DEFAULT 0,
  amount_due      DECIMAL(10,2) DEFAULT 0,
  last_payment_date DATE,
  next_payment_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tax_settings table for GST/VAT configuration
CREATE TABLE IF NOT EXISTS tax_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  tax_name        TEXT NOT NULL DEFAULT 'GST',
  tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 18.00, -- default GST rate in India
  tax_number      TEXT, -- GSTIN of the institute
  hsn_code_default TEXT DEFAULT '999293', -- default HSN for educational services
  sac_code_default TEXT DEFAULT '999293', -- default SAC for educational services
  round_off       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create financial_reports table for automated financial reporting
CREATE TABLE IF NOT EXISTS financial_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL CHECK (report_type IN ('income', 'expense', 'profit_loss', 'balance_sheet', 'cash_flow', 'tax_summary')),
  period_type     TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  report_data     JSONB NOT NULL,
  generated_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_sent_to_accountant BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_institute ON payment_methods(institute_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_client ON payment_methods(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_invoices_institute ON invoices(institute_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_institute ON payments(institute_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_plans_institute ON payment_plans(institute_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_enrollments_plan ON payment_plan_enrollments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_enrollments_client ON payment_plan_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_enrollments_status ON payment_plan_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_tax_settings_institute ON tax_settings(institute_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_institute ON financial_reports(institute_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_financial_reports_period ON financial_reports(period_start, period_end);

-- Enable RLS on new tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
CREATE POLICY payment_methods_owner_all ON payment_methods
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY payment_methods_client_read ON payment_methods
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY payment_methods_insert_own ON payment_methods
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY payment_methods_update_own ON payment_methods
  FOR UPDATE USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY payment_methods_delete_own ON payment_methods
  FOR DELETE USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));

-- RLS policies for invoices
CREATE POLICY invoices_owner_all ON invoices
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY invoices_client_read ON invoices
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY invoices_update_own ON invoices
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY invoices_delete_own ON invoices
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for invoice_items
CREATE POLICY invoice_items_owner_all ON invoice_items
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY invoice_items_access ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE institute_id = get_my_institute_id()
    )
  );

-- RLS policies for payments
CREATE POLICY payments_owner_all ON payments
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY payments_client_read ON payments
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY payments_insert_own ON payments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY payments_update_own ON payments
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for payment_plans
CREATE POLICY payment_plans_owner_all ON payment_plans
  FOR ALL USING (institute_id = get_my_institute_id();

-- RLS policies for payment_plan_enrollments
CREATE POLICY payment_plan_enrollments_owner_all ON payment_plan_enrollments
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY payment_plan_enrollments_client_read ON payment_plan_enrollments
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY payment_plan_enrollments_update_own ON payment_plan_enrollments
  FOR UPDATE USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));

-- RLS policies for tax_settings
CREATE POLICY tax_settings_owner_all ON tax_settings
  FOR ALL USING (institute_id = get_my_institute_id());

-- RLS policies for financial_reports
CREATE POLICY financial_reports_owner_all ON financial_reports
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY financial_reports_access ON financial_reports
  FOR SELECT USING (
    institute_id IN (
      SELECT id FROM institutes WHERE owner_id = auth.uid()
    )
  );

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_invoice_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_payment_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_payment_plan_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_tax_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_financial_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_payment_methods
  BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_payment_methods_updated_at();

CREATE TRIGGER trg_updated_invoices
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_invoices_updated_at();

CREATE TRIGGER trg_updated_invoice_items
  BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_invoice_items_updated_at();

CREATE TRIGGER trg_updated_payments
  BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();

CREATE TRIGGER trg_updated_payment_plans
  BEFORE UPDATE ON payment_plans FOR EACH ROW EXECUTE FUNCTION update_payment_plans_updated_at();

CREATE TRIGGER trg_updated_payment_plan_enrollments
  BEFORE UPDATE ON payment_plan_enrollments FOR EACH ROW EXECUTE FUNCTION update_payment_plan_enrollments_updated_at();

CREATE TRIGGER trg_updated_tax_settings
  BEFORE UPDATE ON tax_settings FOR EACH ROW EXECUTE FUNCTION update_tax_settings_updated_at();

CREATE TRIGGER trg_updated_financial_reports
  BEFORE UPDATE ON financial_reports FOR EACH ROW EXECUTE FUNCTION update_financial_reports_updated_at();

-- Add comments
COMMENT ON TABLE payment_methods IS 'Stored payment methods for clients (tokens/references only)';
COMMENT ON COLUMN payment_methods.payment_type IS 'Type of payment method';
COMMENT ON COLUMN payment_methods.provider IS 'Payment gateway/provider used';
COMMENT ON COLUMN payment_methods.token IS 'Secure reference to actual payment details';
COMMENT ON COLUMN payment_methods.last_four := 'Last 4 digits or identifier';
COMMENT ON COLUMN payment_methods.brand IS 'Brand name of the payment method';
COMMENT ON COLUMN payment_methods.expiry_month IS 'Expiry month for cards';
COMMENT ON COLUMN payment_methods.expiry_year IS 'Expiry year for cards';
COMMENT ON COLUMN payment_methods.is_default IS 'Whether this is the default payment method';
COMMENT ON COLUMN payment_methods.is_verified IS 'Whether the payment method has been verified';
COMMENT ON COLUMN payment_methods.billing_address IS 'JSON object with billing address details';
COMMENT ON TABLE invoices IS 'Formal billing documents issued to clients';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique identifier for the invoice';
COMMENT ON COLUMN invoices.invoice_date IS 'Date the invoice was issued';
COMMENT ON COLUMN invoices.due_date IS 'Date by which payment is expected';
COMMENT ON COLUMN invoices.status IS 'Current status of the invoice';
COMMENT ON COLUMN invoices.subtotal IS 'Amount before taxes and discounts';
COMMENT ON COLUMN invoices.tax_rate IS 'Tax percentage rate';
COMMENT ON COLUMN invoices.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN invoices.discount_amount IS 'Amount of any discounts applied';
COMMENT ON COLUMN invoices.total_amount IS 'Total amount due';
COMMENT ON COLUMN invoices.amount_paid IS 'Amount that has been paid so far';
COMMENT ON COLUMN invoices.amount_due IS 'Remaining amount to be paid';
COMMENT ON COLUMN invoices.currency IS 'Currency of the invoice';
COMMENT ON COLUMN invoices.payment_method_id IS 'Payment method used for this invoice';
COMMENT ON COLUMN invoices.payment_id IS 'Subscription ID if this is a subscription payment';
COMMENT ON COLUMN invoices.notes IS 'Additional notes about the invoice';
COMMENT ON COLUMN invoices.terms_and_conditions IS 'Terms and conditions applicable';
COMMENT ON TABLE invoice_items IS 'Individual line items that make up an invoice';
COMMENT ON COLUMN invoice_items.description IS 'Description of the goods/services';
COMMENT ON COLUMN invoice_items.quantity IS 'Quantity of goods/services';
COMMENT ON COLUMN invoice_items.unit_price IS 'Price per unit';
COMMENT ON COLUMN invoice_items.total_price IS 'Total price for this line item';
COMMENT ON COLUMN invoice_items.tax_included IS 'Whether tax is included in unit_price';
COMMENT ON COLUMN invoice_items.discount_percent IS 'Percentage discount applied';
COMMENT ON COLUMN invoice_items.hsn_code IS 'Harmonized System of Nomenclature code';
COMMENT ON COLUMN invoice_items.sac_code IS 'Services Accounting Code';
COMMENT ON TABLE payments IS 'Record of individual payment transactions';
COMMENT ON COLUMN payments.amount IS 'Amount of the payment transaction';
COMMENT ON COLUMN payments.currency IS 'Currency of the payment';
COMMENT ON COLUMN payments.payment_method IS 'Method used for payment';
COMMENT ON COLUMN payments.provider IS 'Payment gateway/provider used';
COMMENT ON COLUMN payments.transaction_id IS 'Unique transaction ID from gateway';
COMMENT ON COLUMN payments.gateway_response IS 'Full JSON response from payment gateway';
COMMENT ON COLUMN payments.status IS 'Current status of the payment';
COMMENT ON COLUMN payments.paid_at IS 'When the payment was completed';
COMMENT ON COLUMN payments.refunded_at IS 'When the payment was refunded (if applicable)';
COMMENT ON COLUMN payments.refund_amount IS 'Amount that was refunded';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for the refund';
COMMENT ON COLUMN payments.fees_charged IS 'Fees charged by payment gateway';
COMMENT ON COLUMN payments.net_amount IS 'Amount actually received after fees';
COMMENT ON TABLE payment_plans IS 'Installment payment plan options';
COMMENT ON COLUMN payment_plans.name IS 'Name of the payment plan';
COMMENT ON COLUMN payment_plans.description IS 'Detailed description of the plan';
COMMENT ON COLUMN payment_plans.total_amount IS 'Total amount to be paid';
COMMENT ON COLUMN payment_plans.installment_count IS 'Number of installments';
COMMENT ON COLUMN payment_plans.installment_amount IS 'Amount per installment';
COMMENT ON COLUMN payment_plans.interval IS 'Frequency of installments';
COMMENT ON COLUMN payment_plans.start_date IS 'When the plan begins';
COMMENT ON COLUMN payment_plans.end_date IS 'When the plan ends';
COMMENT ON COLUMN payment_plans.grace_period_days IS 'Days allowed after due date before late fees';
COMMENT ON COLUMN payment_plans.late_fee_percent IS 'Percentage charged as late fee';
COMMENT ON TABLE payment_plan_enrollments IS 'Tracking client enrollment in payment plans';
COMMENT ON COLUMN payment_plan_enrollments.start_date IS 'When the client started the plan';
COMMENT ON COLUMN payment_plan_enrollments.end_date IS 'When the client completed/ended the plan';
COMMENT ON COLUMN payment_plan_enrollments.status IS 'Current status of the enrollment';
COMMENT ON COLUMN payment_plan_enrollments.installments_paid IS 'Number of installments paid';
COMMENT ON COLUMN payment_plan_enrollments.total_paid IS 'Total amount paid through the plan';
COMMENT ON COLUMN payment_plan_enrollments.amount_due IS 'Remaining amount to be paid';
COMMENT ON COLUMN payment_plan_enrollments.last_payment_date IS 'Date of most recent payment';
COMMENT ON COLUMN payment_plan_enrollments.next_payment_date IS 'Date of next expected payment';
COMMENT ON TABLE tax_settings IS 'Tax configuration for GST/VAT compliance';
COMMENT ON COLUMN tax_settings.tax_name IS 'Name of the tax (GST, VAT, etc.)';
COMMENT ON COLUMN tax_settings.tax_rate IS 'Percentage rate of the tax';
COMMENT ON COLUMN tax_settings.tax_number IS 'Tax identification number of the institute';
COMMENT ON COLUMN tax_settings.hsn_code_default IS 'Default HSN code for services';
COMMENT ON COLUMN tax_settings.sac_code_default IS 'Default SAC code for services';
COMMENT ON COLUMN tax_settings.round_off IS 'Whether to round off tax calculations';
COMMENT ON TABLE financial_reports IS 'Automated financial reports for institutes';
COMMENT ON COLUMN financial_reports.report_type IS 'Type of financial report';
COMMENT ON COLUMN financial_reports.period_type IS 'Time period covered by report';
COMMENT ON COLUMN financial_reports.period_start IS 'Start date of reporting period';
COMMENT ON COLUMN financial_reports.period_end IS 'End date of reporting period';
COMMENT ON COLUMN financial_reports.report_data IS 'Complete financial data in JSON format';
COMMENT ON COLUMN financial_reports.generated_by IS 'Who generated the report';
COMMENT ON COLUMN financial_reports.is_sent_to_accountant IS 'Whether report was sent to accountant';