# Professional CRM Implementation Plan (QuimeraTech)

Implement a high-end, production-ready CRM based on the comprehensive end-to-end development document provided. This involves expanding the existing schema, building new management modules (Companies, Contacts, Tasks, Contracts), and enhancing the Dashboard with actionable business intelligence.

## Proposed Changes

### 1. Database Schema Expansion (Lovable Cloud)
- **Entities**:
  - `crm_companies`: NIF, sector, size, health status.
  - `crm_contacts`: Role, LinkedIn, primary contact flag, linked to companies.
  - `crm_tasks`: Priority, status (TODO, DOING, BLOCKED, DONE), time tracking, linked to entities.
  - `crm_contracts`: Values, dates, signed status, alerts.
  - `crm_proposals`: Re-integrating or creating a professional builder flow.
  - `crm_meetings`: Scheduled events, notes, outcomes.
  - `crm_audit_logs`: Expanding to a full audit trail (before/after values).
- **Relationships**: Ensure strict foreign key constraints between leads, companies, contacts, projects, and finances.

### 2. Core CRM Modules
- **Companies & Contacts**: Create a centralized database for B2B relationship management.
- **Task Management**: Implement Kanban and List views for tasks across projects and leads.
- **Contract Management**: Lifecycle tracking from draft to signed/active.
- **Lead Conversion Flow**: Automate the creation of companies and projects when a lead is "Won".

### 3. Advanced Dashboard & Business Intelligence
- **"Quimera Insights"**: Real-time actionable alerts (e.g., "3 leads without follow-up for 7 days").
- **Financial Intelligence**: Advanced ticket size, month-over-month revenue comparison, and budget deviation tracking.
- **Health Scores**: Algorithmic scoring for clients and projects based on activity and deadlines.

### 4. Professional UX Enhancements
- **Global Quick Actions**: A persistent "+" button for rapid creation of any entity.
- **Lead/Project Drawers**: Deep-dive details without page navigation.
- **Timeline View**: Chronological history of interactions for every entity.
- **Global Search**: Search across leads, projects, companies, and documents.

### 5. Google Drive Integration (Deepening)
- Full lifecycle management: Open, download, and copy links within the CRM.
- Automated folder structures for Companies and Projects.

## Technical Details

### Backend Structure
- **Server Functions**: Modularize into `src/lib/crm/leads.functions.ts`, `companies.functions.ts`, etc., to avoid large file issues.
- **Supabase Policies**: Implement granular RLS to protect business data.
- **Automation Triggers**: Server-side logic to handle conversions (Lead -> Client/Project).

### Frontend Architecture
- **State Management**: Shared TanStack Query keys for consistent UI updates across the Dashboard and sub-pages.
- **UI Components**: Reusable `EntityDrawer`, `StatusBadge`, and `AuditTimeline` components.
- **Animations**: Refined Framer Motion transitions for executive-level feel.

## User Review Required
> [!IMPORTANT]
> The database schema will grow significantly. I will proceed with creating the new tables and migrations first to ensure data consistency before building the UI modules.

- Should we implement a specific "Support Ticket" system now, or focus on the Sales/Project modules first?
- Do you have a preferred nomenclature for the "Health Score" categories (e.g., Green/Yellow/Red or Healthy/At Risk/Critical)?
