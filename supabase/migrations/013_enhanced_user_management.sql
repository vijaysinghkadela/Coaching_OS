-- ============================================================================
-- Coaching OS — Migration 013: Enhanced User Management
-- ============================================================================

-- Extend profiles table with additional fields for coaches and clients
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS coaching_type TEXT CHECK (coaching_type IN ('academic', 'sports', 'life_career', 'exam_prep', 'language', 'other')),
  ADD COLUMN IF NOT EXISTS specialization TEXT[],
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": true,
    "push": true,
    "in_app": true
  }'::jsonb;

-- Create coach_profiles table for coach-specific information
CREATE TABLE IF NOT EXISTS coach_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  experience_years INTEGER,
  qualifications  TEXT[],
  teaching_style  TEXT,
  hourly_rate     DECIMAL(10,2),
  availability    JSONB DEFAULT '{}'::jsonb,
  max_students    INTEGER DEFAULT 50,
  is_available_for_new_clients BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create client_profiles table for client/parent information
CREATE TABLE IF NOT EXISTS client_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  parent_name     TEXT, -- for student clients
  relationship    TEXT CHECK (relationship IN ('parent', 'guardian', 'self', 'other')),
  emergency_contact TEXT,
  emergency_phone TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'whatsapp')),
  preferred_language TEXT DEFAULT 'en',
  learning_goals    TEXT[],
  constraints       JSONB DEFAULT '{}'::jsonb, -- scheduling constraints, etc.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_coaching_type ON profiles(coaching_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_institute ON coach_profiles(institute_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_institute ON client_profiles(institute_id);

-- Enable RLS on new tables
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_profiles
CREATE POLICY coach_profiles_owner_all ON coach_profiles
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY coach_profiles_self_read ON coach_profiles
  FOR SELECT USING (profile_id = auth.uid());

-- RLS policies for client_profiles
CREATE POLICY client_profiles_owner_all ON client_profiles
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY client_profiles_self_read ON client_profiles
  FOR SELECT USING (profile_id = auth.uid());

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_coach_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_client_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_coach_profiles
  BEFORE UPDATE ON coach_profiles FOR EACH ROW EXECUTE FUNCTION update_coach_profiles_updated_at();

CREATE TRIGGER trg_updated_client_profiles
  BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_client_profiles_updated_at();

-- Insert sample data for coaching types (if needed)
COMMENT ON COLUMN profiles.coaching_type IS 'Type of coaching the user specializes in or seeks';
COMMENT ON COLUMN profiles.specialization IS 'Array of specific subjects or areas of expertise';
COMMENT ON COLUMN profiles.goals IS 'JSON array of user goals';
COMMENT ON COLUMN profiles.preferences IS 'JSON object for user preferences';
COMMENT ON COLUMN profiles.notification_preferences IS 'JSON object for notification settings';