-- Phase 3D: Spark picks (one-way interest) table
-- Created: 2026-05-29

CREATE TABLE sparks_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  picked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volume_id UUID NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  kind VARCHAR(20) DEFAULT 'both', -- 'date', 'connect', 'both'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(picker_user_id, picked_user_id, volume_id) -- Only one pick per pair per event
);

-- Indexes for common queries
CREATE INDEX idx_sparks_picks_picker_user_id ON sparks_picks(picker_user_id);
CREATE INDEX idx_sparks_picks_picked_user_id ON sparks_picks(picked_user_id);
CREATE INDEX idx_sparks_picks_volume_id ON sparks_picks(volume_id);
CREATE INDEX idx_sparks_picks_created_at ON sparks_picks(created_at);

-- RLS: Strict picker-only access
-- CRITICAL: Admins cannot see picks (preserves privacy of who picked whom)
ALTER TABLE sparks_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pickers_view_own_picks" ON sparks_picks
  FOR SELECT USING (auth.uid() = picker_user_id);

CREATE POLICY "users_insert_own_picks" ON sparks_picks
  FOR INSERT WITH CHECK (auth.uid() = picker_user_id);

CREATE POLICY "pickers_update_own_picks" ON sparks_picks
  FOR UPDATE USING (auth.uid() = picker_user_id)
  WITH CHECK (auth.uid() = picker_user_id);

-- No delete policy; picks are permanent
