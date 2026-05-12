# User and Client Management

## Current Implementation
The current Coaching OS implements institute management features rather than individual coach/client management. Users can:
- Register as institute owners (coaching center directors)
- Manage students (enroll, view profiles, update status)
- Assign students to batches
- Track student attendance and performance

## Required Features for Coaching App
For the individual coaching app requested, we need to implement:

### 1. User Registration and Login
- Email/password authentication
- Phone number authentication (optional)
- Social login (Google, Apple) - planned for later phase
- Secure password handling with hashing
- Email verification flow
- Password reset functionality

### 2. Coach and Client Profiles
#### Coach Profile Fields:
- Full name
- Profile photo
- Bio/description
- Contact information (email, phone)
- Coaching type/specialization
- Qualifications/certifications
- Availability schedule
- Payment information (for receiving payments)

#### Client Profile Fields:
- Full name
- Profile photo
- Bio/description
- Contact information (email, phone)
- Emergency contact
- Coaching goals
- Preferences (communication, session type)
- Health information (if relevant to coaching type)
- Assigned coach

### 3. Role-Based Access Control
- Coach: Full access to manage their clients, schedule sessions, view reports
- Admin: Platform-level access (if applicable)
- Client: Access to own profile, scheduling, messaging with coach
- Parent/Guardian: Limited access to minor client's information (if needed)

## Data Model Changes Needed
1. Separate `users` table from `institutes` table
2. Add `profiles` table with role discrimination (coach/client/admin)
3. Add `client_coach_relationships` table to manage associations
4. Update authentication to support individual users rather than institute owners

## API Endpoints Required
- POST /api/auth/register (email/password)
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/social-login (Google/Apple)
- GET /api/profile/[id] (get user profile)
- PUT /api/profile/[id] (update user profile)
- GET /api/clients (for coaches to list their clients)
- GET /api/coaches/[id] (get coach profile)

## Security Considerations
- Implement rate limiting on auth endpoints
- Use HTTP-only cookies for session storage
- Encrypt sensitive profile data at rest
- Validate and sanitize all user inputs
- Implement proper CORS policies

## Implementation Priority (MVP)
1. Email/password authentication system
2. Basic profile creation and editing
3. Coach-client relationship management
4. Simple role-based access (coach vs client)