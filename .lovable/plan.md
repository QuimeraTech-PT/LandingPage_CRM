# Professional CRM Implementation Plan - Stage 2 (Unified Logic & Audit)

Implement a robust B2B relationship model and activity audit system to transition from a prototype to a production-grade CRM.

## User Review Required

> [!IMPORTANT]
> The activity timeline is now centralized and will track every change (leads, projects, tasks, finances). B2B logic is automated: converting a lead now handles company/contact creation without duplicates.

- **Activity Timeline**: Unified component for leads/projects.
- **B2B Automation**: Lead conversion logic now links to companies and contacts.
- **Audit Logs**: Enhanced logging with `oldValue` and `newValue` tracking.
- **Standardized Entities**: New Drawer system for Projects and Companies.
- **Task Kanban**: Full productivity board for team workflow.

## Technical Details

### 1. Database & Server Functions
- Update `logActivity` in `crm.functions.ts` to support `oldValue`/`newValue` columns in `crm_activity_logs`.
- Implement `crm.companies.functions.ts` for B2B operations (CRUD).
- Automate `convertLeadToProject`:
    1. Check if `lead.company` already exists in `crm_companies`.
    2. Create company if missing.
    3. Create a primary contact in `crm_contacts`.
    4. Link project to company.

### 2. UI/UX Standardisation
- **ActivityTimeline**: Component to visualize audit logs with semantic icons and color-coded status.
- **ProjectDrawer**: Tabbed interface (Overview, Tasks, Files, Finance, Activity) mirroring `LeadDrawer`.
- **KanbanBoard**: Update to support generic entity types (leads, projects, tasks).
- **Navigation**: Add "Empresas" and "Tarefas" to the admin sidebar.

### 3. Productivity Module
- Implement `/admin/tasks` with a Kanban board.
- Add `updateTask` server function to support drag-and-drop state changes.

## Infrastructure Updates
- Migration to ensure RLS policies for `crm_companies`, `crm_contacts`, and `crm_tasks` allow authenticated access.
- Indices on `crm_activity_logs(entity_type, entity_id)` for performant timeline rendering.
