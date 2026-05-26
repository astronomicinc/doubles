-- Phase 3B: Applications, Plus-Ones, Payments, and Attendance schema
-- Created: 2026-05-27

-- Applications table: tracks each person's application to an event
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id UUID NOT NULL,
  applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plus_one_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_payment_intent_id TEXT UNIQUE,
  admin_decision VARCHAR(20) DEFAULT NULL, -- 'approved', 'rejected', NULL
  applicant_status VARCHAR(20) DEFAULT 'pending', -- pending, invited, confirmed, cancelled
  plus_one_status VARCHAR(20) DEFAULT 'invited', -- invited, accepted, declined, cancelled
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE CASCADE
);

-- Plus-ones table: tracks the plus-one person invited by applicant
CREATE TABLE plus_ones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(50),
  status VARCHAR(20) DEFAULT 'invited', -- invited, accepted, declined, cancelled
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  why_vouch TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id, email)
);

-- Payments table: tracks Stripe payment intents and status
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  stripe_intent_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL DEFAULT 14500, -- $145.00
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending', -- pending, captured, cancelled, failed
  reason TEXT DEFAULT NULL,
  captured_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table: tracks who actually checked in at the event
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'applicant', -- applicant, plus_one
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id, user_id)
);

-- Indexes for common queries
CREATE INDEX idx_applications_volume_id ON applications(volume_id);
CREATE INDEX idx_applications_applicant_user_id ON applications(applicant_user_id);
CREATE INDEX idx_applications_plus_one_user_id ON applications(plus_one_user_id);
CREATE INDEX idx_applications_admin_decision ON applications(admin_decision);
CREATE INDEX idx_applications_applicant_status ON applications(applicant_status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

CREATE INDEX idx_plus_ones_application_id ON plus_ones(application_id);
CREATE INDEX idx_plus_ones_email ON plus_ones(email);
CREATE INDEX idx_plus_ones_user_id ON plus_ones(user_id);
CREATE INDEX idx_plus_ones_status ON plus_ones(status);

CREATE INDEX idx_payments_application_id ON payments(application_id);
CREATE INDEX idx_payments_stripe_intent_id ON payments(stripe_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_attendance_application_id ON attendance(application_id);
CREATE INDEX idx_attendance_user_id ON attendance(user_id);

-- RLS Policies: Protect data access by user role

-- APPLICATIONS: Users can view/insert their own applications, admins can view all
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_applications" ON applications
  FOR SELECT USING (
    auth.uid() = applicant_user_id
    OR auth.uid() IN (SELECT user_id FROM admin_roles)
  );

CREATE POLICY "public_insert_applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_user_id);

CREATE POLICY "admins_update_applications" ON applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

-- PLUS_ONES: Users can view plus_ones invited to their applications, admins can view all
ALTER TABLE plus_ones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_plus_ones" ON plus_ones
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE applicant_user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT user_id FROM admin_roles)
  );

CREATE POLICY "plus_ones_view_own_record" ON plus_ones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "public_insert_plus_ones" ON plus_ones
  FOR INSERT WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE applicant_user_id = auth.uid()
    )
  );

CREATE POLICY "admins_manage_plus_ones" ON plus_ones
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

-- PAYMENTS: Only admins can view/manage payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_payments" ON payments
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

CREATE POLICY "admins_manage_payments" ON payments
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

-- ATTENDANCE: Only admins can insert/view
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_attendance" ON attendance
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

CREATE POLICY "admins_insert_attendance" ON attendance
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );
