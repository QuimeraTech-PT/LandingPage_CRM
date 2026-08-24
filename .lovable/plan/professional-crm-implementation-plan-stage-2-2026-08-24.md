# Professional CRM Implementation Plan (Stage 2)

Implementing the core logic for Lead-to-Client conversion, B2B relationships, unified activity timeline, and advanced insights as requested in the QuimeraTech CRM objective document.

## User Review Required

> [!IMPORTANT]
> This plan focuses on turning the UI into a functional B2B system. We will be linking Leads to Companies and automate the conversion to Clients.

- **Primary Contact Logic**: When converting a Lead, should we automatically set the person as the "Primary Contact" for the new Company?
- **Health Score**: The document asks for an objective score. I will implement a basic formula based on activity count, overdue tasks, and payment status. Do you have specific weights for these?

## Technical Details

### 1. Lead-to-Client Automation
Refactor `convertLeadToProject` in `src/lib/crm.functions.ts` to:
- Check if the Lead's company already exists in `crm_companies`.
- If not, create a new `crm_companies` record.
- Create a `crm_contacts` record for the Lead.
- Create a `crm_projects` record linked to the new/existing company.
- Update Lead status to `closed_won`.
- Log all steps in `crm_activity_logs`.

### 2. Unified Activity & Audit Logs
- Update `logActivity` helper to support `old_value` and `new_value` for audit purposes.
- Implement a global `ActivityTimeline` component that pulls from `crm_activity_logs`.
- Integrate this timeline into `LeadDrawer` and a new `ProjectDrawer`.

### 3. Professional B2B UI
- **Companies Page**: Implement the full listing with search and filters in `src/routes/admin.companies.tsx`.
- **Contacts Management**: Add contact list and creation within the company context.
- **Project Drawer**: Create `src/components/crm/ProjectDrawer.tsx` to standardize the UI (Overview, Tasks, Files, Finance, Timeline).

### 4. Quimera Insights & BI
- Implement real data-driven alerts in `src/routes/admin.index.tsx` (replacing mocks).
- Create a dedicated `/admin/insights` route for deep-dive metrics (Conversion rate, Win rate, Budget deviation).

### 5. Task System Enhancements
- Implement a global Kanban board for all tasks in `/admin/tasks` (new route).
- Support Drag & Drop status updates for tasks.

## Database Migrations (SQL)
- Update RLS policies to allow authenticated users to read all B2B relationships.
- Add trigger-like logic in server functions to ensure data consistency during lead conversion.
