-- ============================================================================
-- Coaching OS — Migration 018: Content and Learning Resources
-- ============================================================================

-- Create content_categories table for organizing learning materials
CREATE TABLE IF NOT EXISTS content_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  parent_id       UUID REFERENCES content_categories(id) ON DELETE SET NULL,
  icon            TEXT,
  color           TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_items table for individual learning resources
CREATE TABLE IF NOT EXISTS content_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES content_categories(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  content_type    TEXT NOT NULL CHECK (content_type IN (
    'video', 'audio', 'document', 'presentation', 'interactive', 'quiz', 'assessment', 'live_session', 'external_link'
  )),
  file_url        TEXT, -- for locally hosted files
  external_url    TEXT, -- for external resources like YouTube, etc.
  thumbnail_url   TEXT,
  duration        INTEGER, -- in seconds for video/audio
  pages           INTEGER, -- for documents/presentations
  file_size       INTEGER, -- in bytes
  mime_type       TEXT,
  is_downloadable BOOLEAN DEFAULT true,
  is_streamable   BOOLEAN DEFAULT true,
  requires_membership BOOLEAN DEFAULT false,
  price           DECIMAL(10,2) DEFAULT 0,
  currency        TEXT DEFAULT 'INR',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_time  INTEGER, -- estimated time to complete in minutes
  tags            TEXT[] DEFAULT '{}',
  metadata        JSONB DEFAULT '{}'::jsonb, -- flexible metadata for different content types
  version         INTEGER DEFAULT 1,
  is_active       BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  access_count    INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage of users who complete
  average_rating  DECIMAL(2,1) DEFAULT 0, -- average user rating (0-5)
  rating_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_access table for tracking who has accessed what content
CREATE TABLE IF NOT EXISTS content_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  accessed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_duration INTEGER, -- in seconds
  completed       BOOLEAN DEFAULT false,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  rating          DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),
  review          TEXT,
  notes           TEXT,
  device_type     TEXT, -- mobile, desktop, tablet
  ip_address      INET,
  user_agent      TEXT
);

-- Create content_playlists table for curated collections of content
CREATE TABLE IF NOT EXISTS content_playlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NOT NULL,
  description     TEXT,
  playlist_type   TEXT NOT NULL CHECK (playlist_type IN ('course', 'topic', 'skill_building', 'test_prep', 'review')),
  content_ids     UUID[] DEFAULT '{}'::uuid[], -- ordered list of content item IDs
  estimated_duration INTEGER, -- total estimated time in minutes
  is_sequential   BOOLEAN DEFAULT true, -- whether content must be consumed in order
  completion_criteria JSONB DEFAULT '{}'::jsonb, -- what constitutes completion
  drip_schedule   JSONB DEFAULT '{}'::jsonb, -- schedule for releasing content over time
  is_active       BOOLEAN DEFAULT true,
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  access_code     TEXT, -- optional code for access control
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price           DECIMAL(10,2) DEFAULT 0,
  currency        TEXT DEFAULT 'INR',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_playlist_items table for managing playlist content order
CREATE TABLE IF NOT EXISTS content_playlist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id     UUID NOT NULL REFERENCES content_playlists(id) ON DELETE CASCADE,
  content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL, -- position in the playlist
  is_required     BOOLEAN DEFAULT true,
  unlock_condition JSONB DEFAULT '{}'::jsonb, -- conditions that must be met to access
  drip_release_date TIMESTAMPTZ, -- when this item becomes available (if using drip)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_comments table for discussions on content
CREATE TABLE IF NOT EXISTS content_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES content_comments(id) ON DELETE SET NULL, -- for threaded comments
  content         TEXT NOT NULL,
  is_edited       BOOLEAN DEFAULT false,
  edited_at       TIMESTAMPTZ,
  is_deleted      BOOLEAN DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  likes_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_reactions table for reactions to content (likes, etc.)
CREATE TABLE IF NOT EXISTS content_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'inspire', 'useful', 'funny')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_id, user_id, reaction_type)
);

-- Create offline_access table for tracking content available for offline use
CREATE TABLE IF NOT EXISTS offline_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  downloaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ, -- when offline access expires
  file_path       TEXT, -- local file path on device
  file_size       INTEGER,
  is_valid        BOOLEAN DEFAULT true,
  sync_status     TEXT CHECK (sync_status IN ('synced', 'pending', 'conflict')) DEFAULT 'synced',
  last_synced     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_categories_institute ON content_categories(institute_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_parent ON content_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_items_institute ON content_items(institute_id);
CREATE INDEX IF NOT EXISTS idx_content_items_coach ON content_items(coach_id);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_is_featured ON content_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_content_items_is_active ON content_items(is_active);
CREATE INDEX IF NOT EXISTS idx_content_items_difficulty ON content_items(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_content_access_content ON content_access(content_id);
CREATE INDEX IF NOT EXISTS idx_content_access_client ON content_access(client_id);
CREATE INDEX IF NOT EXISTS idx_content_access_student ON content_access(student_id);
CREATE INDEX IF NOT EXISTS idx_content_access_accessed_at ON content_access(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_playlists_institute ON content_playlists(institute_id);
CREATE INDEX IF NOT EXISTS idx_content_playlists_coach ON content_playlists(coach_id);
CREATE INDEX IF NOT EXISTS idx_content_playlists_is_published ON content_playlists(is_published);
CREATE INDEX IF NOT EXISTS idx_content_playlist_items_playlist ON content_playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_content_playlist_items_content ON content_playlist_items(content_id);
CREATE INDEX IF NOT EXISTS idx_content_playlist_items_position ON content_playlist_items(position);
CREATE INDEX IF NOT EXISTS idx_content_comments_content ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_author ON content_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent ON content_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_reactions_content ON content_reactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_reactions_user ON content_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_access_content ON offline_access(content_id);
CREATE INDEX IF NOT EXISTS idx_offline_access_client ON offline_access(client_id);
CREATE INDEX IF NOT EXISTS idx_offline_access_expires ON offline_access(expires_at);

-- Enable RLS on new tables
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_categories
CREATE POLICY content_categories_owner_all ON content_categories
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_categories_read ON content_categories
  FOR SELECT USING (institute_id = get_my_institute_id());

-- RLS policies for content_items
CREATE POLICY content_items_owner_all ON content_items
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_items_coach_read ON content_items
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY content_items_client_read ON content_items
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    ) OR
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );
CREATE POLICY content_items_public_read ON content_items
  FOR SELECT USING (
    is_active = true AND
    (is_featured = true OR price = 0) AND
    (requires_membership = false OR
     EXISTS (
       SELECT 1 FROM program_enrollments
       WHERE program_enrollments.client_id IN (
         SELECT id FROM client_profiles WHERE profile_id = auth.uid()
       ) AND
       program_enrollments.status = 'active'
     ))
  );

-- RLS policies for content_access
CREATE POLICY content_access_owner_all ON content_access
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_access_client_read ON content_access
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY content_access_student_read ON content_access
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY content_access_insert_own ON content_access
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    ) OR
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- RLS policies for content_playlists
CREATE POLICY content_playlists_owner_all ON content_playlists
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_playlists_coach_read ON content_playlists
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY content_playlists_client_read ON content_playlists
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM content_playlist_items
      WHERE content_playlist_items.playlist_id = content_playlists.id
        AND content_playlist_items.content_id IN (
          SELECT id FROM content_items
          WHERE institute_id = get_my_institute_id()
        )
        AND content_playlist_items.is_required = true
  )
  );

-- RLS policies for content_playlist_items
CREATE POLICY content_playlist_items_owner_all ON content_playlist_items
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_playlist_items_access ON content_playlist_items
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM content_playlists WHERE institute_id = get_my_institute_id()
    )
  );

-- RLS policies for content_comments
CREATE POLICY content_comments_owner_all ON content_comments
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_comments_access ON content_comments
  FOR SELECT USING (
    content_id IN (
      SELECT id FROM content_items WHERE institute_id = get_my_institute_id()
    ) OR
    author_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
CREATE POLICY content_comments_update_own ON content_comments
  FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY content_comments_delete_own ON content_comments
  FOR DELETE USING (author_id = auth.uid());

-- RLS policies for content_reactions
CREATE POLICY content_reactions_owner_all ON content_reactions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY content_reactions_access ON content_reactions
  FOR SELECT USING (
    content_id IN (
      SELECT id FROM content_items WHERE institute_id = get_my_institute_id()
    ) OR
    user_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
CREATE POLICY content_reactions_insert_own ON content_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS policies for offline_access
CREATE POLICY offline_access_owner_all ON offline_access
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY offline_access_client_read ON offline_access
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY offline_access_insert_own ON offline_access
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_content_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_playlist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_content_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_offline_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_content_categories
  BEFORE UPDATE ON content_categories FOR EACH ROW EXECUTE FUNCTION update_content_categories_updated_at();

CREATE TRIGGER trg_updated_content_items
  BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

CREATE TRIGGER trg_updated_content_access
  BEFORE UPDATE ON content_access FOR EACH ROW EXECUTE FUNCTION update_content_access_updated_at();

CREATE TRIGGER trg_updated_content_playlists
  BEFORE UPDATE ON content_playlists FOR EACH ROW EXECUTE FUNCTION update_content_playlists_updated_at();

CREATE TRIGGER trg_updated_content_playlist_items
  BEFORE UPDATE ON content_playlist_items FOR EACH ROW EXECUTE FUNCTION update_content_playlist_items_updated_at();

CREATE TRIGGER trg_updated_content_comments
  BEFORE UPDATE ON content_comments FOR EACH ROW EXECUTE FUNCTION update_content_comments_updated_at();

CREATE TRIGGER trg_updated_content_reactions
  BEFORE UPDATE ON content_reactions FOR EACH ROW EXECUTE FUNCTION update_content_reactions_updated_at();

CREATE TRIGGER trg_updated_offline_access
  BEFORE UPDATE ON offline_access FOR EACH ROW EXECUTE FUNCTION update_offline_access_updated_at();

-- Add comments
COMMENT ON TABLE content_categories IS 'Hierarchical organization system for learning content';
COMMENT ON COLUMN content_categories.parent_id IS 'Reference to parent category for hierarchy';
COMMENT ON COLUMN content_categories.icon IS 'Icon identifier for UI display';
COMMENT ON COLUMN content_categories.color IS 'Hex color code for category visualization';
COMMENT ON COLUMN content_categories.sort_order IS 'Display order within parent category';
COMMENT ON TABLE content_items IS 'Individual learning resources and materials';
COMMENT ON COLUMN content_items.content_type IS 'Format/type of the learning content';
COMMENT ON COLUMN content_items.file_url IS 'URL to locally hosted file content';
COMMENT ON COLUMN content_items.external_url IS 'URL to externally hosted content';
COMMENT ON COLUMN content_items.duration IS 'Length in seconds for video/audio content';
COMMENT ON COLUMN content_items.pages IS 'Number of pages for document/content';
COMMENT ON COLUMN content_items.file_size IS 'Size in bytes of the content file';
COMMENT ON COLUMN content_items.mime_type IS 'MIME type of the content file';
COMMENT ON COLUMN content_items.is_downloadable IS 'Whether users can download the content';
COMMENT ON COLUMN content_items.is_streamable IS 'Whether content can be streamed';
COMMENT ON COLUMN content_items.requires_membership IS 'Whether access requires paid membership';
COMMENT ON COLUMN content_items.price IS 'Cost to access the content (if not free)';
COMMENT ON COLUMN content_items.difficulty_level IS 'Skill level required to benefit from content';
COMMENT ON COLUMN content_items.estimated_time IS 'Estimated time to complete in minutes';
COMMENT ON COLUMN content_items.tags IS 'Array of tags for content discovery';
COMMENT ON COLUMN content_items.metadata IS 'Flexible JSON storage for content-type specific data';
COMMENT ON COLUMN content_items.version IS 'Version number for content updates';
COMMENT ON COLUMN content_items.is_featured IS 'Whether content is highlighted/promoted';
COMMENT ON COLUMN content_items.access_count IS 'Number of times content has been accessed';
COMMENT ON COLUMN content_items.completion_rate IS 'Percentage of users who fully complete';
COMMENT ON COLUMN content_items.average_rating IS 'Average rating from users (0-5 scale)';
COMMENT ON COLUMN content_items.rating_count IS 'Number of ratings received';
COMMENT ON TABLE content_access IS 'Tracking of user interactions with content';
COMMENT ON COLUMN content_access.accessed_at IS 'When the content was accessed';
COMMENT ON COLUMN content_access.access_duration IS 'How long the user engaged with content';
COMMENT ON COLUMN content_access.completed IS 'Whether user finished the content';
COMMENT ON COLUMN content_access.progress_percentage IS 'How much of content was completed';
COMMENT ON COLUMN content_access.rating IS 'User rating for this content access (0-5)';
COMMENT ON COLUMN content_access.review IS 'Written feedback from user';
COMMENT ON COLUMN content_access.notes IS 'Private notes from user about the content';
COMMENT ON COLUMN content_access.device_type IS 'Type of device used to access content';
COMMENT ON COLUMN content_access.ip_address IS 'IP address used for access';
COMMENT ON COLUMN content_access.user_agent IS 'Browser/user agent string';
COMMENT ON TABLE content_playlists IS 'Curated collections of content for structured learning';
COMMENT ON COLUMN content_playlists.title IS 'Name of the playlist/collection';
COMMENT ON COLUMN content_playlists.description IS 'Detailed explanation of the playlist purpose';
COMMENT ON COLUMN content_playlists.playlist_type IS 'Category or purpose of the playlist';
COMMENT ON COLUMN content_playlists.content_ids IS 'Array of content item IDs in the playlist';
COMMENT ON COLUMN content_playlists.estimated_duration IS 'Total estimated time to complete playlist';
COMMENT ON COLUMN content_playlists.is_sequential IS 'Whether content must be consumed in order';
COMMENT ON COLUMN content_playlists.completion_criteria IS 'JSON defining what constitutes completion';
COMMENT ON COLUMN content_playlists.drip_schedule IS 'JSON schedule for releasing content over time';
COMMENT ON COLUMN content_playlists.is_published IS 'Whether playlist is available to users';
COMMENT ON COLUMN content_playlists.published_at IS 'When the playlist was made available';
COMMENT ON COLUMN content_playlists.access_code IS 'Optional code required for access';
COMMENT ON COLUMN content_playlists.max_participants IS 'Maximum number of users allowed';
COMMENT ON COLUMN content_playlists.current_participants IS 'Current number of enrolled users';
COMMENT ON COLUMN content_playlists.price IS 'Cost to access the playlist';
COMMENT ON TABLE content_playlist_items IS 'Individual items within content playlists';
COMMENT ON COLUMN content_playlist_items.position IS 'Position of content within the playlist (0-based)';
COMMENT ON COLUMN content_playlist_items.is_required IS 'Whether this item is mandatory for completion';
COMMENT ON COLUMN content_playlist_items.unlock_condition IS 'JSON conditions that must be met to access';
COMMENT ON COLUMN content_playlist_items.drip_release_date IS 'When this item becomes available';
COMMENT ON TABLE content_comments IS 'Discussion and feedback on content items';
COMMENT ON COLUMN content_comments.author_id IS 'Who wrote the comment';
COMMENT ON COLUMN content_comments.parent_id IS 'Reference to parent comment for threading';
COMMENT ON COLUMN content_comments.content IS 'The actual comment text';
COMMENT ON COLUMN content_comments.is_edited IS 'Whether the comment has been edited';
COMMENT ON COLUMN content_comments.edited_at IS 'When the comment was last edited';
COMMENT ON COLUMN content_comments.is_deleted IS 'Whether the comment has been deleted';
COMMENT ON COLUMN content_comments.deleted_at IS 'When the comment was deleted';
COMMENT ON COLUMN content_comments.likes_count IS 'Number of likes the comment has received';
COMMENT ON TABLE content_reactions IS 'Quick reactions/feedback to content (likes, etc.)';
COMMENT ON COLUMN content_reactions.reaction_type IS 'Type of reaction expressed';
COMMENT ON TABLE offline_access IS 'Tracking of content downloaded for offline use';
COMMENT ON COLUMN offline_access.downloaded_at IS 'When the content was downloaded';
COMMENT ON COLUMN offline_access.expires_at IS 'When the offline access expires';
COMMENT ON COLUMN offline_access.file_path IS 'Local file path where content is stored';
COMMENT ON COLUMN offline_access.file_size IS 'Size of the downloaded file in bytes';
COMMENT ON COLUMN offline_access.is_valid IS 'Whether the downloaded file is still valid';
COMMENT ON COLUMN offline_access.sync_status IS 'Sync status with server version';
COMMENT ON COLUMN offline_access.last_synced IS 'When the offline copy was last synced';