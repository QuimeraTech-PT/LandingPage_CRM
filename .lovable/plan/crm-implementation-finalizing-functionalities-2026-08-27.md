# CRM Implementation - Finalizing Functionalities

This plan focuses on completing identified functional gaps to ensure a production-ready CRM experience.

## Technical Details

- **Task Management**: Finish the "Add Task" modal and linking logic in both Project and Lead drawers.
- **Support Module**: Add a "Ticket Details" view/drawer to allow team members to see full descriptions and update status easily.
- **Financial Intelligence**: Move `getRevenueForecast` from `supabaseAdmin` to an authenticated `supabase` context for proper security.
- **Activity System**: Add a "Note/Comment" feature to the timeline so team members can add manual entries, not just system-generated logs.
- **UX Polish**: Implement the "Delete" action for leads (which was missing a handler).

## Proposed Changes

### CRM Core Functions
- Update `FinancesPage` and `crm.functions.ts` to support transaction deletions or corrections.
- Add `createActivityLog` server function for manual notes.

### Task Management
- Create a `TaskModal.tsx` or update `admin.tasks.tsx` to handle task creation via the UI.
- Wire up the "Add Task" buttons in `LeadDrawer` and `ProjectDrawer`.

### Support Module
- Create `TicketDrawer.tsx` to show full ticket content and history.

### Security
- Refactor `finances.functions.ts` to use `requireSupabaseAuth` and the user's Supabase client.

## Implementation Steps

1. **Activity Notes**: Add a server function to allow manual activity logging (notes) and update `LeadDrawer`/`ProjectDrawer` to support adding them.
2. **Task Creation**: Implement a global task creation dialog reachable from the `GlobalActions` or specific drawers.
3. **Support UX**: Add a drawer to `admin.support.tsx` to view and manage individual tickets.
4. **Lead Deletion**: Implement the delete lead functionality in `admin.leads.tsx`.
5. **Revenue Forecast**: Secure the revenue forecast function.