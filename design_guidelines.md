# Design Guidelines: 3D Printer Care Application

## Design Approach

**Selected Framework**: Material Design 3 (adapted for industrial/technical context)

**Justification**: This is a utility-focused, information-dense application requiring efficient data management, clear visual hierarchy, and reliability. Material Design provides:
- Robust component patterns for complex dashboards and data tables
- Excellent status indication systems (crucial for maintenance tracking)
- Strong color theory for semantic meaning (overdue/warning/success states)
- Proven accessibility patterns for role-based interfaces

## Core Design Principles

1. **Clarity Over Aesthetics**: Information legibility and quick scanning trump decorative elements
2. **Status-First Design**: Color-coded visual language for task states (overdue=red, today=orange, upcoming=green)
3. **Density Control**: Compact data presentation without sacrificing readability
4. **Trust & Reliability**: Professional, stable interface that inspires confidence in critical maintenance tracking

---

## Color Palette

### Dark Mode (Primary Interface)
**Background Tones**:
- Primary background: 220 15% 12%
- Surface/card: 220 15% 16%
- Elevated surface: 220 15% 20%
- Borders: 220 10% 28%

**Brand & Accent**:
- Primary (actions): 210 95% 55% (trustworthy blue)
- Primary hover: 210 95% 45%
- Text on primary: 0 0% 100%

**Semantic Status Colors** (Critical for maintenance app):
- Overdue/Critical: 0 75% 60% (red)
- Due Today/Warning: 35 92% 55% (orange)
- Upcoming/Success: 145 65% 45% (green)
- Info/Neutral: 210 60% 50% (blue)

**Text Hierarchy**:
- Primary text: 220 10% 92%
- Secondary text: 220 8% 70%
- Disabled text: 220 5% 50%

### Light Mode (Alternative)
- Background: 220 20% 98%
- Surface: 0 0% 100%
- Primary: 210 95% 45%
- Use darker versions of semantic colors for better contrast

---

## Typography

**Font Family**: 
- Primary: 'Inter' or 'Roboto' (Google Fonts) - excellent for data-dense interfaces
- Monospace: 'JetBrains Mono' for serial numbers, IP addresses, technical details

**Type Scale**:
- Page titles: 32px / font-bold (2xl)
- Section headers: 24px / font-semibold (xl)
- Card titles: 18px / font-semibold (lg)
- Body text: 16px / font-normal (base)
- Small labels: 14px / font-medium (sm)
- Micro text (metadata): 12px / font-normal (xs)

**Line Height**: 
- Headers: 1.2
- Body: 1.5
- Compact tables: 1.4

---

## Layout System

**Container Strategy**:
- Dashboard: full-width with max-w-7xl centered
- Forms/Details: max-w-4xl for optimal readability
- Tables: full-width within container for data scanning

**Spacing Primitives** (Tailwind units):
- **Core spacing set**: 2, 4, 6, 8, 12, 16 units
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Page margins: px-4 md:px-8, py-6 md:py-12
- Card spacing: p-6
- Form fields: space-y-4

**Grid Patterns**:
- Dashboard stats: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Printer cards: 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Task board columns: 4-column flex layout (flex-1 basis per column)

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Height: h-16
- Dark background: 220 15% 14%
- Logo/brand left, user menu right
- Active link indicator: border-b-2 with primary color
- Role badge next to username (ADMIN/OPERATOR/VIEWER)

**Sidebar Navigation** (for main sections):
- Width: w-64 on desktop, collapsible on mobile
- Icons + labels for: Dashboard, Printers, Tasks, Board, Logs, Settings, Scan
- Active state: background 220 15% 24% with left border accent

### Cards & Surfaces

**Printer Card**:
- Background: surface color
- Border: 1px solid border color
- **Overdue state**: border-2 border-red-500 with subtle red glow
- Rounded corners: rounded-lg
- Shadow: subtle shadow-md on hover
- Internal structure:
  - Header with printer name (font-semibold) + model (text-sm text-secondary)
  - Location icon + text
  - Status indicators row (colored badges for overdue/today counts)
  - Action buttons at bottom
  - 🔒 icon in top-right corner for RESTRICTED printers

**Dashboard Stat Cards**:
- Larger text for numbers (text-3xl font-bold)
- Semantic color coding for different metrics
- Icon in corner (subtle opacity)
- Compact padding: p-4

### Tables

**Data Table Pattern**:
- Striped rows: odd rows slightly darker (220 15% 17%)
- Header row: sticky top, background 220 15% 18%, font-semibold
- Row hover: background 220 15% 22%
- Cell padding: px-4 py-3
- Borders: horizontal only (border-b)
- Action column: right-aligned with icon buttons

### Forms

**Input Fields**:
- Background: 220 15% 18%
- Border: 1px solid 220 10% 28%
- Focus state: border primary color + subtle ring
- Padding: px-4 py-2
- Height: h-10 (standard inputs)
- Labels: text-sm font-medium, mb-2

**Buttons**:
- Primary: background primary, text white, px-6 py-2, rounded-md
- Secondary: border variant with primary border, transparent background
- Danger: red background for destructive actions
- Icon buttons: p-2, rounded-md, hover background change
- Disabled state: opacity-50, cursor-not-allowed

### Status & Feedback

**Badges**:
- Overdue: bg-red-500/20 text-red-400 border border-red-500/30
- Due Today: bg-orange-500/20 text-orange-400 border border-orange-500/30
- Upcoming: bg-green-500/20 text-green-400 border border-green-500/30
- Rounded: rounded-full, px-3 py-1, text-xs font-medium

**Flash Messages**:
- Success: green background with checkmark icon
- Error: red background with X icon
- Info: blue background with info icon
- Positioned at top of page, dismissible
- Padding: p-4, rounded-lg

### Specialized Components

**Task Board (Kanban)**:
- 4 columns: Overdue, Today, This Week, Upcoming
- Column headers with count badges
- Cards: compact (p-4), draggable indicator
- Cards show: task title, printer name, priority indicator (1-10 dots or bar)
- Drop zones with dashed borders

**QR Scanner Interface**:
- Full-screen camera view
- Overlay with corner guides (white/primary color)
- Instructions at bottom in semi-transparent panel
- Cancel button in top-right

### Data Visualization

**Priority Indicators**:
- Visual bar (1-10 scale): horizontal bar with gradient from green (1) to red (10)
- Or dot system: filled dots corresponding to priority level

**Progress Tracking**:
- Circular progress for print hours/job counts toward next maintenance
- Color transitions from green → orange → red as approaching due date

---

## Iconography

**Icon Library**: Heroicons (outline for most UI, solid for filled states)
- Size: w-5 h-5 for inline icons, w-6 h-6 for standalone
- Color: inherit from text color
- Common icons: printer, wrench, calendar, clock, user, settings, qr-code, bell

---

## Interaction Patterns

**Hover States**: Subtle background color shift (4-8% lighter), no dramatic transformations
**Loading States**: Skeleton screens for tables, spinner for buttons
**Empty States**: Centered message with icon, muted text, CTA button
**Confirmation Dialogs**: Modal overlay with dark backdrop (opacity-75), centered card

---

## Accessibility Notes

- All form inputs have visible labels
- Color is never sole indicator (combine with icons/text)
- Focus states clearly visible (2px ring)
- Role-based UI elements show/hide cleanly (no confusing partial access)
- Skip navigation link for keyboard users