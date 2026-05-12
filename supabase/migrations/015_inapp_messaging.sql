-- ============================================================================
-- Coaching OS — Migration 015: In-App Messaging
-- ============================================================================

-- Create conversations table for chat threads
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  participant_one UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('one_on_one', 'group', 'announcement')),
  title           TEXT, -- for group conversations
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_one, participant_two, conversation_type) WHERE conversation_type = 'one_on_one'
);

-- Create conversation_participants table for group conversations
CREATE TABLE IF NOT EXISTS conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at         TIMESTAMPTZ,
  role            TEXT CHECK (role IN ('member', 'admin', 'moderator')) DEFAULT 'member',
  is_muted        BOOLEAN DEFAULT false,
  custom_notifications JSONB DEFAULT '{}'::jsonb,
  UNIQUE(conversation_id, profile_id)
);

-- Create messages table for individual chat messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT REFERENCES profiles(id) ON DELETE CASCADE,
  message_type    TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location', 'contact', 'system')),
  content         TEXT, -- for text messages or caption for media
  file_url        TEXT, -- for images, files, audio, video
  file_name       TEXT,
  file_size       INTEGER,
  mime_type       TEXT,
  width           INTEGER, -- for images/video
  height          INTEGER, -- for images/video
  duration        INTEGER, -- for audio/video in seconds
  latitude        DECIMAL(9,6), -- for location messages
  longitude       DECIMAL(9,6), -- for location messages
  reply_to_id     UUID REFERENCES messages(id) ON DELETE SET NULL, -- for threaded conversations
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  is_edited       BOOLEAN DEFAULT false,
  edited_at       TIMESTAMPTZ,
  is_deleted      BOOLEAN DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('sending', 'sent', 'delivered', 'read')) DEFAULT 'sending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message_receipts table for read receipts in group chats
CREATE TABLE IF NOT EXISTS message_receipts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, profile_id)
);

-- Create message_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction   TEXT NOT NULL, -- emoji or custom reaction
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, profile_id, reaction)
);

-- Create chat_settings table for user preferences
CREATE TABLE IF NOT EXISTS chat_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institute_id        UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  show_previews       BOOLEAN DEFAULT true,
  save_to_camera_roll BOOLEAN DEFAULT false,
  data_usage          TEXT CHECK (data_usage IN ('low', 'standard', 'high')) DEFAULT 'standard',
  block_list          UUID[] DEFAULT '{}'::uuid[], -- list of blocked profile IDs
  notification_sound  TEXT,
  chat_backup         BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_institute ON conversations(institute_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_one, participant_two);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_profile ON conversation_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_profile ON message_receipts(profile_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_profile ON message_reactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_profile ON chat_settings(profile_id);

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY conversations_owner_all ON conversations
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY conversations_access ON conversations
  FOR SELECT USING (
    participant_one = auth.uid() OR
    participant_two = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.profile_id = auth.uid()
        AND (conversation_participants.left_at IS NULL OR conversation_participants.left_at > now())
    )
  );
CREATE POLICY conversations_update ON conversations
  FOR UPDATE USING (institute_id = get_my_institute_id());
CREATE POLICY conversations_insert ON conversations
  FOR INSERT WITH CHECK (institute_id = get_my_institute_id());

-- RLS policies for conversation_participants
CREATE POLICY conversation_participants_owner_all ON conversation_participants
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY conversation_participants_access ON conversation_participants
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_participants.conversation_id
        AND conversations.institute_id = get_my_institute_id()
    )
  );

-- RLS policies for messages
CREATE POLICY messages_owner_all ON messages
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY messages_access ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.institute_id = get_my_institute_id()
    )
  );
CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.institute_id = get_my_institute_id()
    )
  );
CREATE POLICY messages_update_own ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- RLS policies for message_receipts
CREATE POLICY message_receipts_owner_all ON message_receipts
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY message_receipts_access ON message_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_receipts.message_id
        AND messages.conversation_id IN (
          SELECT id FROM conversations WHERE institute_id = get_my_institute_id()
        )
    )
  );

-- RLS policies for message_reactions
CREATE POLICY message_reactions_owner_all ON message_reactions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY message_reactions_access ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_reactions.message_id
        AND messages.conversation_id IN (
          SELECT id FROM conversations WHERE institute_id = get_my_institute_id()
        )
    )
  );

-- RLS policies for chat_settings
CREATE POLICY chat_settings_owner_all ON chat_settings
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY chat_settings_self ON chat_settings
  FOR ALL USING (profile_id = auth.uid());

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_conversation_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_message_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_message_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_conversations
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_conversations_updated_at();

CREATE TRIGGER trg_updated_conversation_participants
  BEFORE UPDATE ON conversation_participants FOR EACH ROW EXECUTE FUNCTION update_conversation_participants_updated_at();

CREATE TRIGGER trg_updated_messages
  BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_messages_updated_at();

CREATE TRIGGER trg_updated_message_receipts
  BEFORE UPDATE ON message_receipts FOR EACH ROW EXECUTE FUNCTION update_message_receipts_updated_at();

CREATE TRIGGER trg_updated_message_reactions
  BEFORE UPDATE ON message_reactions FOR EACH ROW EXECUTE FUNCTION update_message_reactions_updated_at();

CREATE TRIGGER trg_updated_chat_settings
  BEFORE UPDATE ON chat_settings FOR EACH ROW EXECUTE FUNCTION update_chat_settings_updated_at();

-- Add comments
COMMENT ON TABLE conversations IS 'Chat conversations between users';
COMMENT ON COLUMN conversations.conversation_type IS 'Type of conversation: one-on-one, group, or announcement';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of the most recent message in the conversation';
COMMENT ON TABLE conversation_participants IS 'Participants in group conversations';
COMMENT ON COLUMN conversation_participants.role IS 'Role of participant in the conversation';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN messages.message_type IS 'Type of message content';
COMMENT ON COLUMN messages.content IS 'Text content of the message';
COMMENT ON COLUMN messages.file_url IS 'URL to attached media file';
COMMENT ON COLUMN messages.reply_to_id IS 'Reference to message being replied to';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by recipient';
COMMENT ON TABLE message_receipts IS 'Read receipts for messages in group chats';
COMMENT ON TABLE message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE chat_settings IS 'User-specific chat preferences and settings';