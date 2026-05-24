-- Initial Doubles Database Schema
-- Run: supabase db push

-- ========================================================
-- USERS TABLE
-- ========================================================
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  phone text,
  dietary_restrictions text,
  photo_url text,
  photo_consent boolean DEFAULT false,
  sms_consent boolean DEFAULT false,
  room_tease_optin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- VOLUMES TABLE (Events)
-- ========================================================
CREATE TABLE volumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'announced',
  doors_date date NOT NULL,
  doors_time_start time DEFAULT '18:00',
  doors_time_end time DEFAULT '21:00',
  venue_name text,
  venue_address text,
  venue_lat float,
  venue_lng float,
  capacity int DEFAULT 30,
  speaker_id uuid REFERENCES users(id),
  speaker_public_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- APPLICATIONS TABLE
-- ========================================================
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id uuid NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  applicant_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',

  -- Payment
  applicant_payment_intent_id text,
  friend_payment_intent_id text,

  -- Friend invite
  friend_invite_token text UNIQUE,
  friend_invite_sent_at timestamptz,
  friend_invite_expires_at timestamptz,
  friend_submitted_at timestamptz,
  friend_reminder_sent_at timestamptz,

  -- Admin decision
  admin_decision text DEFAULT 'pending',
  admin_decision_at timestamptz,

  -- Seating
  applicant_seat_number int,
  friend_seat_number int,

  -- Preferences
  preferred_dietary text,
  preferred_dietary_friend text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(volume_id, applicant_user_id, friend_user_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_applications_volume_id ON applications(volume_id);
CREATE INDEX idx_applications_applicant_user_id ON applications(applicant_user_id);
CREATE INDEX idx_applications_friend_user_id ON applications(friend_user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ========================================================
-- SPARKS_PICKS TABLE (One-way post-event picks)
-- Privacy-critical: RLS enforces that only picker can read own picks
-- ========================================================
CREATE TABLE sparks_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  picked_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  volume_id uuid NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  kind text NOT NULL,
  created_at timestamptz DEFAULT now(),

  UNIQUE(picker_user_id, picked_user_id, volume_id)
);

ALTER TABLE sparks_picks ENABLE ROW LEVEL SECURITY;

-- RLS: Picker can only see own picks
CREATE POLICY "sparks_picks_user_see_own"
  ON sparks_picks FOR SELECT
  USING (auth.uid() = picker_user_id);

-- RLS: Picker can insert own picks
CREATE POLICY "sparks_picks_user_insert_own"
  ON sparks_picks FOR INSERT
  WITH CHECK (auth.uid() = picker_user_id);

-- RLS: Admin cannot see (enforced via service role only in server functions)
CREATE INDEX idx_sparks_picks_picker ON sparks_picks(picker_user_id);
CREATE INDEX idx_sparks_picks_picked ON sparks_picks(picked_user_id);
CREATE INDEX idx_sparks_picks_volume ON sparks_picks(volume_id);

-- ========================================================
-- MUTUALS TABLE (Computed mutual connections)
-- Admin-only visibility
-- ========================================================
CREATE TABLE mutuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id uuid NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  user_a_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  computed_at timestamptz DEFAULT now(),
  intro_sent_at timestamptz,
  intro_held_until timestamptz,
  archived_at timestamptz,

  UNIQUE(volume_id, user_a_id, user_b_id)
);

ALTER TABLE mutuals ENABLE ROW LEVEL SECURITY;

-- RLS: Admins see all; members see only their mutuals
CREATE POLICY "mutuals_admin_see_all"
  ON mutuals FOR SELECT
  USING (
    (SELECT auth.jwt()->>'role' = 'admin') OR
    auth.uid() = user_a_id OR
    auth.uid() = user_b_id
  );

CREATE INDEX idx_mutuals_volume ON mutuals(volume_id);
CREATE INDEX idx_mutuals_user_a ON mutuals(user_a_id);
CREATE INDEX idx_mutuals_user_b ON mutuals(user_b_id);

-- ========================================================
-- REVIEWS TABLE (Admin decisions log)
-- ========================================================
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES users(id),
  decision text NOT NULL,
  notes text,
  decided_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- DISPATCH_ISSUES TABLE (Newsletter)
-- ========================================================
CREATE TABLE dispatch_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number int UNIQUE NOT NULL,
  title text NOT NULL,
  dek text,
  body_md text,
  hero_kind text,
  published_at timestamptz,
  read_minutes int,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dispatch_issues ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- SPEAKER_PITCHES TABLE
-- ========================================================
CREATE TABLE speaker_pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  current_role text,
  story_pitch text NOT NULL,
  preferred_volume text,
  context_link text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE speaker_pitches ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- PHOTOS TABLE
-- ========================================================
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id uuid REFERENCES volumes(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  is_wide_shot boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- EMAILS_SENT TABLE (Audit log)
-- ========================================================
CREATE TABLE emails_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  kind text NOT NULL,
  volume_id uuid REFERENCES volumes(id),
  data jsonb,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'
);

ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- DEFAULT RLS POLICIES
-- ========================================================

-- Users: members see only themselves
CREATE POLICY "users_see_self"
  ON users FOR SELECT
  USING (auth.uid() = id OR (SELECT auth.jwt()->>'role' = 'admin'));

-- Users: no one can update except themselves
CREATE POLICY "users_update_self"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Volumes: public can see all
CREATE POLICY "volumes_public_read"
  ON volumes FOR SELECT
  USING (true);

-- Applications: members see own; admins see all
CREATE POLICY "applications_user_see_own"
  ON applications FOR SELECT
  USING (
    auth.uid() = applicant_user_id OR
    auth.uid() = friend_user_id OR
    (SELECT auth.jwt()->>'role' = 'admin')
  );

-- Applications: members can insert own
CREATE POLICY "applications_user_insert"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_user_id);

-- Dispatch: public can see published
CREATE POLICY "dispatch_public_read"
  ON dispatch_issues FOR SELECT
  USING (status = 'published');

-- Speaker pitches: anyone can insert
CREATE POLICY "speaker_pitches_public_insert"
  ON speaker_pitches FOR INSERT
  WITH CHECK (true);

-- Photos: public can see
CREATE POLICY "photos_public_read"
  ON photos FOR SELECT
  USING (true);

-- Emails: only admins can see
CREATE POLICY "emails_admin_read"
  ON emails_sent FOR SELECT
  USING ((SELECT auth.jwt()->>'role' = 'admin'));
