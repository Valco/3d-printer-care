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
- **Dashboard stat card hover details** (October 2025): Interactive task list popups on stat card icons
  - Hover over stat card icons (Прострочені, Сьогодні, Майбутні) to see detailed task list
  - HoverCard displays aggregated tasks from all printers with task name and printer name
  - Scrollable list (max-h-60) for many tasks
  - Color-coded borders matching stat card variant (overdue=red, today=orange, upcoming=green)

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
- **Complete Internationalization** (October 2025): Full bilingual interface with Ukrainian and English
  - React-i18next integration for real-time language switching
  - Ukrainian as primary language, English as alternative
  - LanguageToggle component in header for instant language switching
  - Dynamic date-fns locale (getDateLocale helper) - dates format correctly in both languages
  - Translation coverage: All 13 pages (Dashboard, Printers, Tasks, TaskBoard, WorkLogs, Users, Groups, Categories, Scan, SMTPSettings, TelegramSettings, Settings, Login) and 4 major components (PrinterCard, WorkLogForm, TaskBoardColumn, PrinterDetailsDialog)
  - Translation files organized by feature domain (common, nav, dashboard, printer, task, workLog, user, group, category, smtp, telegram, qrScanner, settings, status, messages)
  - All UI elements translated: navigation, forms, validation messages, toasts, placeholders, buttons, labels
  - Language preference persists across page navigation
- **Task assignment management** (October 2025): Flexible printer-task assignment via checkbox interface in printer edit dialogs
  - Dashboard displays color-coded task indicators: upcoming (green), today (yellow/orange), overdue (red)
  - Printer settings include task configuration section showing all available tasks with checkboxes
  - Real-time schedule add/remove with state synchronization
  - Task assignment accessible from both Dashboard (PrinterDetailsDialog) and Printers page
- **SMTP Configuration** (October 2025): Manual SMTP setup for self-hosted deployments
  - Admin-only settings page at /settings/smtp
  - Configurable fields: host, port, SSL/TLS, username, from name/email, reminder time
  - Password encryption using AES-256-CBC with SESSION_SECRET as encryption key
  - Password required on initial setup, optional on updates (existing password retained)
  - Configurable reminder time: admin can set custom time for daily email reminders (default: 08:00)
  - Settings stored in SMTPSettings database table
- **Telegram Configuration** (October 2025): Telegram bot integration for task reminder notifications
  - Admin-only settings page at /settings/telegram
  - Configurable fields: bot token, chat ID, notification preferences (enabled, notify overdue, notify today), reminder time
  - Bot token encryption using AES-256-CBC with SESSION_SECRET as encryption key
  - Token required on initial setup, optional on updates (existing token retained)
  - Configurable reminder time: admin can set custom time for daily Telegram reminders (default: 08:00)
  - Settings stored in TelegramSettings database table
  - Supports sending reminders to Telegram chat/group for tasks due today or overdue
- **Automated Notifications** (October 2025): Dual scheduler system for email and Telegram reminders
  - **Dual Scheduler Architecture**: Separate independent schedulers for email and Telegram notifications
    - Each system has its own configurable reminder time stored in database
    - Email scheduler (updateEmailScheduler) reads from SMTPSettings.reminderTime
    - Telegram scheduler (updateTelegramScheduler) reads from TelegramSettings.reminderTime
    - Schedulers dynamically update when admin changes reminder time in respective settings
  - **Email Notifications**: Daily email reminders for tasks due today
    - Scheduled via node-cron with configurable reminder time (default: 08:00)
    - Sends formatted HTML email with table of tasks (printer, task name, priority)
    - Recipients gathered from PrinterEmailRecipient table (unique emails across all printers)
    - Uses encrypted SMTP settings from database (AES-256-CBC with SESSION_SECRET)
    - Admin-only test endpoint at POST /api/test/send-task-reminders for manual testing
  - **Telegram Notifications**: Daily Telegram reminders for tasks due today
    - Scheduled via node-cron with configurable reminder time (default: 08:00)
    - Sends formatted message to configured chat/group via Telegram bot API
    - Uses encrypted bot token from database (AES-256-CBC with SESSION_SECRET)
    - Respects enabled/disabled flags and notification preferences
  - **Shared Logic**: getTasksDueToday() function used by both notification systems
  - **Robust Error Handling**: Missing config, malformed encryption, send failures

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
- Users with role-based permissions, group memberships, and optional Telegram nicknames for personalized notifications
- User Groups for access control
- Printers with visibility settings and usage metrics (print hours, job counts)
- Maintenance Tasks with categories, priority levels, and **dynamic field configuration**
- Printer Task Schedules with interval types (DAYS, PRINT_HOURS, JOB_COUNT)
- Work Logs for completed maintenance with **dynamic field storage**
- Email Recipients for notifications
- Task Categories for organization
- SMTP Settings for email notification configuration (self-hosted deployments)
- Telegram Settings for task reminder notifications via Telegram bot (self-hosted deployments)

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