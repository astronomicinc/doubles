-- Create intros table for mutual match pairings
CREATE TABLE IF NOT EXISTS intros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id UUID NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind_a VARCHAR(10), -- 'date', 'connect', or 'both' (user_a's pick type)
  kind_b VARCHAR(10), -- 'date', 'connect', or 'both' (user_b's pick type)
  email_sent_at TIMESTAMP WITH TIME ZONE,
  user_a_viewed_at TIMESTAMP WITH TIME ZONE,
  user_b_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: user_a_id < user_b_id (normalized pair ordering to prevent duplicates)
  CONSTRAINT user_a_lt_user_b CHECK (user_a_id < user_b_id),

  -- Unique constraint to prevent duplicate intros for same pair in same volume
  UNIQUE(volume_id, user_a_id, user_b_id)
);

-- Indexes for query performance
CREATE INDEX idx_intros_volume_id ON intros(volume_id);
CREATE INDEX idx_intros_user_a_id ON intros(user_a_id);
CREATE INDEX idx_intros_user_b_id ON intros(user_b_id);
CREATE INDEX idx_intros_created_at ON intros(created_at DESC);

-- Enable RLS
ALTER TABLE intros ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can view intros where they are either party
CREATE POLICY intros_users_view ON intros
  FOR SELECT
  USING (
    user_a_id = auth.uid() OR user_b_id = auth.uid()
  );

-- RLS Policy 2: Only backend service can insert intros
-- (authenticated users cannot directly insert; only jobs via service key)
CREATE POLICY intros_service_insert ON intros
  FOR INSERT
  WITH CHECK (false); -- No one can insert directly; only service role via job

-- RLS Policy 3: Users can update viewed_at flags on their own intros
CREATE POLICY intros_users_update_viewed ON intros
  FOR UPDATE
  USING (
    user_a_id = auth.uid() OR user_b_id = auth.uid()
  )
  WITH CHECK (
    user_a_id = auth.uid() OR user_b_id = auth.uid()
  );

-- Grant permissions
GRANT SELECT ON intros TO authenticated;
GRANT UPDATE(user_a_viewed_at, user_b_viewed_at) ON intros TO authenticated;
