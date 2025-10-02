# 3D Printer Care - Maintenance Management System

## Overview

3D Printer Care is a comprehensive web application designed to manage maintenance schedules, work logs, and task tracking for 3D printers. The system supports role-based access control, automated scheduling, QR code integration for quick printer identification, and multi-language support (Ukrainian/English). It's built as a utility-focused application with emphasis on information density, clear status indication, and reliable maintenance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**UI Component Library**: 
- shadcn/ui (Radix UI primitives) following Material Design 3 principles adapted for industrial/technical context
- Tailwind CSS for styling with custom design tokens
- Dark mode as primary interface with light mode alternative

**State Management**:
- TanStack Query (React Query) for server state management and caching
- React hooks for local component state
- Session-based authentication state

**Routing**: Wouter for lightweight client-side routing

**Key Design Principles**:
- Status-first design with semantic color coding (overdue=red, today=orange, upcoming=green)
- Information density without sacrificing readability
- Professional, trust-inspiring interface for critical maintenance tracking
- **Visual task indicators** (October 2025): Each task displayed as individual colored circle on printer cards
  - Circular cells (24x24px) with status-based colors: green (upcoming), yellow (today), red (overdue)
  - Interactive tooltips showing task name and due date on hover
  - Auto-categorization: tasks automatically move between color categories as due dates change
  - Ordered display: upcoming → today → overdue (left to right)

### Backend Architecture

**Runtime**: Node.js with Express.js framework using TypeScript

**API Pattern**: RESTful API with session-based authentication

**Server Structure**:
- Route-based organization (`/routes` directory)
- Middleware for authentication and authorization
- Service layer for business logic (notifications, scheduling)
- Role-based access control (ADMIN, OPERATOR, VIEWER)

**Authentication & Authorization**:
- Session management using express-session with PostgreSQL session store
- Password hashing with bcrypt
- Role-based middleware for endpoint protection
- Group-based printer access control (PUBLIC/RESTRICTED visibility)

**Key Features**:
- Automated task scheduling based on time intervals, print hours, or job counts
- Work log tracking with printer metrics
- QR code generation for printer identification
- QR code scanning with camera for quick access to printer work logs
- Email digest notifications (nodemailer)
- Internationalization support (i18n - Ukrainian/English)
- **Task assignment management** (October 2025): Flexible printer-task assignment via checkbox interface in printer edit dialogs
  - Dashboard displays color-coded task indicators: upcoming (green), today (yellow/orange), overdue (red)
  - Printer settings include task configuration section showing all available tasks with checkboxes
  - Real-time schedule add/remove with state synchronization
  - Task assignment accessible from both Dashboard (PrinterDetailsDialog) and Printers page
- **SMTP Configuration** (October 2025): Manual SMTP setup for self-hosted deployments
  - Admin-only settings page at /settings/smtp
  - Configurable fields: host, port, SSL/TLS, username, from name/email
  - Password encryption using AES-256-CBC with SESSION_SECRET as encryption key
  - Password required on initial setup, optional on updates (existing password retained)
  - Settings stored in SMTPSettings database table

**QR Scanner Implementation** (`/scan` route):
- Camera-based QR code scanning using @zxing/browser
- Supports both JSON format (`{type: "printer", id: "...", name: "..."}`) and raw printer IDs
- Duplicate detection to prevent repeated scans of the same printer
- Comprehensive error handling: permission denied, camera busy, device not found
- **Workflow**: 
  - Dashboard "Сканувати QR" button → navigates to /scan
  - QR scan → redirects to Dashboard with ?addWorkLog={printerId}
  - Dashboard auto-opens work log form with preselected printer
- Mobile-friendly interface for on-site maintenance teams

### Database Architecture

**Database**: PostgreSQL (Neon serverless)

**ORM Strategy**: Dual ORM approach
- Drizzle ORM as primary data layer (schema in `shared/schema.ts`)
- Prisma for migrations and seeding (`prisma/schema.prisma`, `prisma/seed.ts`)

**Core Data Models**:
- Users with role-based permissions and group memberships
- User Groups for access control
- Printers with visibility settings and usage metrics (print hours, job counts)
- Maintenance Tasks with categories, priority levels, and **dynamic field configuration**
- Printer Task Schedules with interval types (DAYS, PRINT_HOURS, JOB_COUNT)
- Work Logs for completed maintenance with **dynamic field storage**
- Email Recipients for notifications
- Task Categories for organization
- SMTP Settings for email notification configuration (self-hosted deployments)

**Dynamic Field System** (Updated October 2025):
- MaintenanceTask configuration fields:
  - `requiresAxis`: boolean - whether work log must specify axis (X/Y/Z)
  - `requiresNozzleSize`: boolean - whether work log must specify nozzle size
  - `requiresPlasticType`: boolean - whether work log must specify plastic type
  - `customFieldLabel`: string - optional custom field label
  - `customFieldType`: "TEXT" | "NUMBER" - type of custom field
- WorkLog dynamic fields:
  - `axis`: string - axis specification when required
  - `nozzleSize`: string - nozzle size when required
  - `plasticType`: string - plastic type when required
  - `customFieldValue`: string - custom field value when configured
- WorkLogForm intelligently displays only configured fields based on selected task
- Server-side validation enforces task requirements before persisting work logs

**Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### External Dependencies

**Third-Party Services**:
- Neon Database (PostgreSQL serverless hosting)
- Email service integration via nodemailer

**Key Libraries**:
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Validation**: express-validator, Zod (drizzle-zod) for schema validation
- **Scheduling**: node-cron for automated task scheduling
- **QR Codes**: qrcode library for generation, @zxing/browser for camera-based scanning
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Styling**: Tailwind CSS with custom Material Design 3 tokens
- **State Management**: TanStack Query v5
- **Notifications**: connect-flash for flash messages, custom toast system

**Development Tools**:
- Vite for frontend bundling and development
- esbuild for backend bundling
- tsx for TypeScript execution
- Replit-specific plugins for development environment integration