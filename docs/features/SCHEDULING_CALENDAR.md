# Scheduling and Calendar

## Current Implementation
The current Coaching OS has basic scheduling features for institutes:
- Batch/timetable management
- Manual attendance tracking
- QR code-based attendance
- No client self-scheduling capabilities

## Required Features for Coaching App
For the individual coaching app requested, we need to implement:

### 1. Self-Scheduling System
- Clients can view coach's available time slots
- Real-time availability checking
- Timezone support
- Buffer time between sessions
- Recurring session booking

### 2. Calendar Synchronization
- Google Calendar integration (two-way sync)
- Outlook Calendar integration
- iCal/ICS feed support
- Conflict detection across calendars
- Manual sync option

### 3. Session Management
- Booking, rescheduling, cancellation
- Waiting list for fully booked slots
- Automated rescheduling options
- Session history tracking
- Cancellation policies (late cancellation fees, etc.)

### 4. Reminders and Notifications
- Push notifications for upcoming sessions
- Email reminders (configurable timing)
- SMS reminders (via Twilio or similar)
- No-show tracking
- Late cancellation penalty system

### 5. Calendar View Components
- Day/week/month views
- Agenda view
- Time slot visualization
- Color-coding by session type
- Drag-and-drop rescheduling (where applicable)

## Technical Implementation

### Database Schema Changes
1. `sessions` table:
   - id, coach_id, client_id
   - start_time, end_time, timezone
   - status (scheduled, completed, cancelled, no-show)
   - meeting_type (in-person, video, phone)
   - meeting_link (for video calls)
   - notes, agenda
   - recurrence_rule (for repeating sessions)
   - reminder_sent_at

2. `availability_slots` table:
   - id, coach_id
   - start_time, end_time, timezone
   - is_recurring, recurrence_pattern
   - buffer_before, buffer_after
   - max_clients_per_slot (for group sessions)

3. `calendar_syncs` table:
   - id, user_id
   - provider (google, outlook, ical)
   - external_calendar_id
   - sync_token, last_synced_at
   - sync_direction (two-way, read-only)

### API Endpoints
- GET /api/availability (get coach's available slots)
- POST /api/sessions (book a session)
- PUT /api/sessions/[id] (reschedule)
- DELETE /api/sessions/[id] (cancel)
- GET /api/sessions/[id] (get session details)
- GET /api/calendar/sync (initiate calendar sync)
- POST /api/calendar/webhook (receive calendar provider updates)

### Frontend Components
- CalendarView component (using react-day-picker or similar)
- AvailabilitySlot component
- SessionBookingModal
- SessionDetailsView
- CalendarSyncSettings

## Third-Party Integrations
- Google Calendar API
- Microsoft Graph API (for Outlook)
- Nodemailer or SendGrid for email reminders
- Twilio or AWS SNS for SMS reminders
- WebSocket connections for real-time updates

## Security and Privacy
- Validate all time inputs to prevent injection
- Ensure clients can only see their own sessions
- Encrypt meeting links and sensitive session data
- Implement rate limiting on booking endpoints
- Secure webhook validation for calendar providers

## Implementation Priority (MVP)
1. Basic session booking system (coach sets availability, client books)
2. Simple calendar view showing booked sessions
3. Email reminders for upcoming sessions
4. Basic rescheduling and cancellation
5. Calendar sync (starting with Google Calendar)