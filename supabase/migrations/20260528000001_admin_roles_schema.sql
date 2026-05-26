-- Phase 3C: Admin roles table for access control
-- Created: 2026-05-28

CREATE TABLE admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin', -- admin, moderator, super_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient role lookups
CREATE INDEX idx_admin_roles_user_id ON admin_roles(user_id);

-- RLS: Only admins can view admin_roles table (self-verification)
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_admin_roles" ON admin_roles
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT user_id FROM admin_roles)
  );
