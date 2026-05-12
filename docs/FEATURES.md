# Coaching OS — Feature Documentation

This document describes the actual implemented features of Coaching OS, a school management system for coaching institutes in India.

## Overview
Coaching OS is a comprehensive school management system built with Next.js 16.2.6, TypeScript, Tailwind CSS, and Supabase. It's designed specifically for coaching institutes in India, with features for student management, fee tracking, attendance, and communication.

## Implemented Features

### 1. User & Client Management
- **Authentication**: Email + password login via Supabase Auth
- **Profiles**: Institute owner profile management
- **Role-based access**: Owner/admin access control via Row Level Security
- **Multi-tenancy**: Each institute's data is isolated using Supabase RLS

### 2. Student Management
- **Student Records**: Complete student profiles with enrollment numbers, contact info, academic details
- **Batch/Course Assignment**: Students assigned to specific batches and courses
- **Status Tracking**: Active/inactive/graduated status management
- **Search & Filter**: Real-time student search by name, enrollment number
- **Document Association**: Link documents to student profiles

### 3. Fee Management
- **Fee Structures**: Template-based fee configuration for different courses
- **Installment Plans**: Configurable payment installments (1-4 installments)
- **GST Calculation**: Automatic 18% GST calculation on all fees
- **Payment Tracking**: Real-time payment status (pending, partial, paid, overdue)
- **Multiple Payment Methods**: Cash, UPI, bank transfer, Razorpay integration
- **Receipt Generation**: Auto-generated receipt numbers (RCP-0001 format)
- **Payment Triggers**: Automatic fee record updates after payments

### 4. Attendance Management
- **Session Tracking**: Daily batch-wise attendance sessions
- **QR Code Self-Marking**: Generate QR codes for student self-attendance
- **Status Tracking**: Present/absent/late/excused attendance status
- **Attendance Percentage**: Automatic calculation of attendance percentages
- **Historical Trends**: 30-day attendance trend visualization
- **Session Uniqueness**: One session per batch per day constraint

### 5. Communication System
- **WhatsApp Integration**: Simulated WhatsApp messaging for:
  - Attendance alerts (consecutive absences)
  - Fee reminders (upcoming payments)
  - Test results (score sharing)
  - Broadcast messages (institute-wide announcements)
- **Message Templates**: Predefined templates for common communications
- **Delivery Tracking**: Message status tracking (queued, sent, delivered, failed)

### 6. Document Management
- **File Upload**: Support for PDF, JPG, PNG, DOC formats (up to 10MB)
- **Document Categorization**: Predefined categories (Admit Card, TC, Aadhaar, Birth Certificate, Other)
- **Student Association**: Link documents to specific student profiles
- **Verification System**: Coach toggle for Verified/Pending document status
- **Timestamps**: Upload date/time and last accessed tracking
- **Privacy Consent**: Mandatory consent popup for sensitive documents
- **File Icons**: Visual differentiation by file type (PDF vs image)
- **Search & Filter**: Document search by student name or filename

### 7. AI-Powered Features
- **Study Plan Generator**: AI-generated personalized study plans using Claude AI
  - Demo mode with pre-built realistic plans
  - Pro tier requirement for AI features
  - Subject-specific plans (JEE/NEET/Board)
  - Week-by-week breakdown with daily targets
  - Milestone tracking and progress goals
- **Parent Report Generator**: AI-powered progress reports for parents
  - Performance analysis and improvement suggestions
  - Subject-wise breakdown and recommendations

### 8. Timetable & Schedule Management
- **Weekly Schedule**: Visual timetable grid for batches
- **Slot Management**: Create/edit timetable slots with subject, teacher, room
- **Conflict Detection**: Prevent teacher and room double-booking
- **Flexible Scheduling**: Support for various subject combinations per batch
- **Academic Year Tracking**: Session planning by academic year

### 9. Settings & Configuration
- **Institute Management**: Basic institute profile (name, city, GSTIN)
- **Course Management**: Create/manage educational programs (JEE, NEET, Board)
- **Batch Management**: Create and manage student batches with capacity limits
- **Room Management**: Configure classrooms and labs with capacity
- **Staff Management**: Teaching and administrative staff (Pro tier)
- **Subscription Management**: SaaS subscription plans (Starter, Growth, Pro)

### 10. Dashboard & Analytics
- **Key Performance Indicators**: Real-time metrics cards
  - Total students, active batches, attendance percentage, monthly fees
- **Attendance Trends**: Visualization of attendance over time
- **Revenue Tracking**: Monthly fee collection visualization
- **Subject Performance**: Bar chart showing average scores by subject
- **Fee Collection Status**: Visual breakdown of payment statuses
- **Batch Performance**: Comparative analysis of different batches
- **Top Performers**: Ranking of students by academic performance
- **Recent Activity Feed**: Timeline of recent payments and enrollments

### 11. Communication & Notifications
- **In-app Notifications**: Real-time alerts for important events
- **Email/SMS Integration**: Prepared for external communication services
- **Announcement System**: Institute-wide broadcast capabilities
- **Personalized Messages**: Student-specific communications

## Technical Implementation Details

### Frontend Architecture
- **Framework**: Next.js 16.2.6 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom CSS variables
- **UI Components**: Custom component library based on @base-ui/react primitives
- **State Management**: React hooks (useState, useEffect, useContext)
- **Form Handling**: React Hook Form with Zod validation schemas
- **Data Fetching**: React Query/SWR patterns with optimistic updates
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts library for data visualization

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) with Row Level Security on all tables
- **Authentication**: Supabase Auth with email/password providers
- **Storage**: Supabase Storage for document and file uploads
- **Real-time Capabilities**: Supabase subscriptions for live data updates
- **API Routes**: Next.js API routes for custom business logic
- **Middleware**: Custom authentication and role-based access control
- **Edge Functions**: Supabase Edge Functions for WhatsApp and AI features
- **Triggers**: Database triggers for automatic fee record updates

### Security & Compliance
- **Row Level Security**: Database-level isolation of institute data
- **Authentication**: JWT-based session management
- **Authorization**: Role-based access via RLS policies
- **Data Protection**: Encryption at rest for sensitive fields (Aadhar numbers)
- **Input Validation**: Comprehensive client and server-side validation
- **CSRF Protection**: Next.js built-in CSRF protection
- **XSS Prevention**: Automatic escaping in React templates
- **GST Compliance**: 18% tax calculation following Indian GST regulations
- **Data Privacy**: Consent-based handling of sensitive documents

### DevOps & Deployment
- **Platform**: Optimized for Vercel deployment
- **Environment Variables**: Configured via .env.local for different environments
- **Build Process**: Next.js optimized production builds with Turbopack
- **Database Migrations**: Supabase migration system for schema updates
- **Environment Separation**: Development, staging, and production environments
- **Backup Strategy**: Supabase automated backups and point-in-time recovery
- **Monitoring**: Prepared for integration with logging and monitoring services

## Data Model Summary

### Core Tables
- **institutes**: Root tenant entity (one per coaching center)
- **courses**: Educational programs offered (JEE, NEET, Board exams)
- **batches**: Student groups within courses
- **students**: Individual learner records with enrollment numbers
- **staff**: Teaching and administrative personnel
- **fee_structures**: Pricing templates for courses
- **fee_records**: Per-student fee ledger and payment tracking
- **payment_transactions**: Individual payment records with GST receipts
- **attendance_sessions**: Daily class sessions for batches
- **attendance_records**: Student attendance status per session
- **tests**: Assessments and examinations
- **test_scores**: Student performance records on tests
- **whatsapp_messages**: Communication logs and templates
- **saas_subscriptions**: Billing and subscription management
- **ai_usage**: Logging of AI feature consumption for billing

### Key Relationships
- Institutes → Courses → Batches → Students (hierarchical structure)
- Institutes ←→ Staff (employment relationship)
- Fee Structures ←→ Fee Records (template to instance)
- Payment Transactions → Fee Records (updates payment status)
- Attendance Sessions ←→ Attendance Records (session to student status)
- Tests ←→ Test Scores (assessment to student performance)
- Institutes ←→ WhatsApp Messages (communication scope)
- Institutes ←→ AI Usage (feature consumption tracking)

## Quality Assurance Measures

### Code Quality
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **ESLint**: Configured with Next.js and TypeScript-specific rules
- **Component Consistency**: Reusable UI components with standardized props
- **Error Boundaries**: Graceful error handling throughout the application
- **Loading States**: Skeleton loaders and spinners for async operations
- **Empty States**: Meaningful empty state descriptions for all data views

### Performance Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Dynamic imports for non-critical components
- **Image Optimization**: Next.js Image component for optimized asset delivery
- **Bundle Analysis**: Regular bundle size monitoring
- **Database Indexing**: Strategic indexing for query performance
- **Caching**: SWR/stale-while-revalidate for data fetching

### Accessibility
- **Semantic HTML**: Proper use of landmark elements and headings
- **ARIA Labels**: Accessible names for interactive components
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Logical tab order and focus trapping in modals
- **Screen Reader Support**: Proper labeling for form elements and dynamic content

### Testing & Validation
- **Type Safety**: Compile-time type checking prevents runtime errors
- **Prop Validation**: Component prop types validated at runtime
- **Form Validation**: Client and server-side validation for all inputs
- **Business Logic**: Server-side enforcement of business rules
- **Data Integrity**: Database constraints and triggers for consistency
- **Edge Case Handling**: Comprehensive testing of boundary conditions

## Recent Improvements & Fixes

During the latest code review, the following issues were resolved:

### TypeScript Corrections
1. Fixed property name mismatches in analytics components (`collected` → `amount`)
2. Corrected Select component type handling to match @base-ui/react specifications
3. Fixed state type mismatches in document management component
4. Resolved inconsistent type assertions throughout the codebase

### ESLint/Warnings Resolution
1. Addressed missing alt attributes for Image components (with appropriate eslint-disables for Lucide Icons)
2. Fixed Select onValueChange handler type mismatches
3. Improved form handling with proper null checking and default values
4. Standardized event handler patterns across Select components

### Code Quality Enhancements
1. Ensured consistent state management patterns with proper TypeScript types
2. Fixed import ordering and removed unused variable warnings
3. Improved error handling in asynchronous operations
4. Standardized conditional rendering patterns
5. Enhanced accessibility attributes on interactive elements

## Deployment Instructions

### Prerequisites
- Node.js 18.x or later
- Supabase account and project
- Vercel account for deployment
- Razorpay account for payment processing (optional)
- Anthropic API key for AI features (optional)

### Setup Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and configure:
   - Supabase URL and anon key
   - Razorpay key ID and secret (for payments)
   - Anthropic API key (for AI features)
   - NextAuth secret (for authentication)
4. Set up Supabase database using the schema in `docs/DATABASE.md`
5. Run development server: `npm run dev`
6. Build for production: `npm run build`
7. Start production server: `npm run start`

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for backend)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key ID (optional)
- `RAZORPAY_KEY_SECRET`: Razorpay key secret (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key for AI features (optional)
- `NEXT_PUBLIC_APP_URL`: Application URL for authentication callbacks
- `NEXT_PUBLIC_ENABLE_DEMO_MODE`: Enable demo mode with mock data

## Future Enhancements

Planned features for future releases include:
1. **Mobile Application**: React Native mobile apps for iOS and Android
2. **Advanced Analytics**: Predictive analytics and early warning systems
3. **Enhanced AI Features**: Personalized learning recommendations and adaptive difficulty
4. **Payment Gateway Expansion**: Additional payment methods and international support
5. **Communication Channels**: In-app chat, video conferencing, and email integration
6. **Calendar Integration**: Google Calendar and Outlook synchronization
7. **Reporting Engine**: Custom report builder with export capabilities
8. **Integration Hub**: API marketplace for third-party integrations
9. **Gamification**: Badges, points, and leaderboards for student engagement
10. **Parent Portal**: Dedicated interface for parents to monitor progress

## License and Usage

Coaching OS is developed for Manglam Technical Agency (MTA) and is intended for use by coaching institutes and educational organizations. The system incorporates MSME-registered expertise (UDYAM-RJ-15-0094091) and follows Indian educational technology standards.

For licensing inquiries, customization requests, or support, please contact the development team through the official channels.