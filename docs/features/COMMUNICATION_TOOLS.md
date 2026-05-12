# Communication Tools

## Overview
This document outlines the communication features required for the coaching app MVP and full implementation.

## MVP Features (Minimum Viable Product)

### 1. In-app Text Chat
- One-to-one chat between coach and client
- Real-time message delivery
- Message persistence (store chat history)
- Basic UI: message bubbles, timestamps, read receipts
- Push notifications for new messages (when app is in background)

### 2. Session Notes/Comments
- Coach can add short notes after each session
- Clients can view notes from past sessions
- Notes are associated with specific sessions
- Simple text editor (no rich text needed for MVP)

## Full Implementation Features

### 1. Enhanced Messaging
- Group chat for cohort-based coaching
- Message reactions (emojis)
- File sharing (images, PDFs, documents)
- Message threading/replies
- Search within chat history
- Message pinning (for important information)
- Typing indicators
- Read receipts with timestamps

### 2. Audio and Video Calls
- Built-in video conferencing (WebRTC)
- Screen sharing capability
- Call recording (with consent)
- Audio-only call option
- Integration with external services (Zoom, Google Meet) as alternative
- Call scheduling from within the app
- Call history and logging

### 3. Community Features
- Community channels/topics for broader discussions
- Announcements from coach to all clients
- Client-to-client messaging (with privacy controls)
- Moderation tools for coaches
- Activity feed within communities

## Technical Implementation

### Database Schema
1. `messages` table:
   - id, session_id (optional), sender_id, receiver_id
   - content, message_type (text, image, file, system)
   - is_read, read_at, created_at
   - reply_to_message_id (for threading)
   - metadata (for attachments, reactions, etc.)

2. `chat_sessions` table (for organizing conversations):
   - id, participant_ids (array), created_at, updated_at
   - last_message_at, last_message_id
   - is_group, title (for group chats)

3. `session_notes` table:
   - id, session_id, author_id (coach), content
   - created_at, updated_at

### API Endpoints
- GET /api/chats (get user's chat sessions)
- GET /api/chats/[id]/messages (get messages for a chat)
- POST /api/chats/[id]/messages (send a message)
- PUT /api/messages/[id]/read (mark as read)
- POST /api/sessions/[id]/notes (add session note)
- GET /api/sessions/[id]/notes (get session notes)
- POST /api/calls/initiate (start audio/video call)
- POST /api/calls/[id]/end (end call)

### Frontend Components
- ChatList component (shows recent conversations)
- ChatView component (displays messages in a session)
- MessageInput component (text input with attachment button)
- MessageBubble component (individual message display)
- SessionNotesView (display and add notes for a session)
- CallControls component (video/audio call interface)
- CommunityList and CommunityView components

### Third-Party Services
- WebRTC implementation (using Twilio Video, Agora, or simplepeer)
- File storage (Supabase Storage or AWS S3 for attachments)
- Push notification service (Firebase Cloud Messaging or similar)
- Email fallback for notifications

### Security and Privacy
- End-to-end encryption consideration for sensitive conversations
- Message retention policies
- Ability to delete conversations (soft delete)
- Reporting/blocking features for inappropriate messages
- GDPR compliance for message data

## Implementation Priority (MVP)
1. Basic text chat between coach and client
2. Simple session notes feature
3. Real-time messaging using Supabase Repositories or WebSocket fallback
4. Push notifications for new messages
5. Basic UI for viewing chat history

## Dependencies
- @supabase/supabase-js (for real-time capabilities)
- A WebRTC library for video calls (future phase)
- A notification service (expo-push-token, firebase/messaging, etc.)