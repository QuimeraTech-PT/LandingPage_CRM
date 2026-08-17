# Implementation Plan - CRM Finance & Revenue Forecast

## Overview
Add revenue forecasting for the next 3-6 months and expand the Finance module to handle project-specific expenses, invoices, and due dates.

## Proposed Changes

### Database & Backend
1.  **Schema Update**:
    *   Add `due_date` (date) and `invoice_url` (text) to `crm_finances`.
    *   Add `status` (text: 'paid', 'pending', 'overdue') to `crm_finances` if not already flexible.
2.  **Server Functions (`src/lib/crm.functions.ts`)**:
    *   `getRevenueForecast`: Calculate expected revenue based on:
        *   Won leads with `estimated_value` not yet fully invoiced.
        *   Pending `income` transactions in `crm_finances`.
        *   Average conversion rate of current `negotiation` and `proposal` leads.
    *   Update `createTransaction` and `getTransactions` to handle new fields.

### Components
1.  **Revenue Forecast Widget (`src/components/crm/RevenueForecast.tsx`)**:
    *   Visual chart (Bar or Area) showing projected income vs. expenses for the next 6 months.
    *   Breakdown of "Confirmed" (closed deals) vs "Probable" (leads in funnel).
2.  **Invoice/Expense Modal (`src/routes/admin.finances.tsx`)**:
    *   Update the transaction form to include `due_date` and `project` classification.
    *   Add status indicators (Pending/Paid) and visual alerts for overdue items.

### Dashboard Integration
1.  **Home Widget (`src/routes/admin.index.tsx`)**:
    *   Mount the new `RevenueForecast` widget.
    *   Add a "Financial Alerts" list for overdue payments/expenses.

## Technical Details
*   **Forecast Formula**: `ConfirmedRevenue + (ProposalValue * 0.7) + (NegotiationValue * 0.4)`.
*   **Dependencies**: TanStack Query for data fetching, Lucide icons for status.
