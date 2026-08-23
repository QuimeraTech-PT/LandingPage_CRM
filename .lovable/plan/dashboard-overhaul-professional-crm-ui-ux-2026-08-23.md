# Dashboard Overhaul: Professional CRM UI/UX

Transform the existing admin dashboard into a top-tier, professional CRM interface with enhanced visual hierarchy, better information density, and integrated analytics.

## Proposed Changes

### 1. Dashboard Redesign (`src/routes/admin.index.tsx`)
- **New Layout Structure**: Switch to a more organized grid with clearer sections for "Business Intelligence" (Stats/Forecast), "Operations" (Leads/Pipeline), and "Monitoring" (Activity Logs).
- **Enhanced Visuals**: Use specialized card designs for different data types. Add more context to metrics (e.g., month-over-month growth if possible).
- **Interactive Pipeline**: Refactor the Sales Funnel to be more visual and interactive.
- **Improved Information Density**: Better use of whitespace and typography to handle more data without clutter.

### 2. CRM Core Enhancements (`src/lib/crm.functions.ts`)
- **Advanced Stats**: Update `getCRMStats` to include:
  - Lead conversion rate.
  - Average project budget.
  - Upcoming project deadlines.
- **Activity Intelligence**: Better categorization of logs for the new dashboard monitoring section.

### 3. Navigation & Consistency
- **Unified Sidebar/Header**: Ensure the admin area has a consistent, professional navigation experience.
- **Global Theme Alignment**: Deeply integrate the QuimeraTech "Blue/Cyan/Midnight" branding into all CRM components.

### 4. Component Updates
- **`CRMStats`**: Create a new standalone component for the dashboard metrics to reduce `admin.index.tsx` complexity.
- **`ActivityMonitor`**: Refactor activity logs into a more robust monitoring widget.

## Technical Details
- **Data Fetching**: Optimize React Query usage to ensure the dashboard feels "live" but efficient.
- **Animation**: Use Framer Motion for subtle, professional transitions between dashboard states.
- **Responsiveness**: Ensure the "Top-Tier" experience translates well to tablets and desktops.
