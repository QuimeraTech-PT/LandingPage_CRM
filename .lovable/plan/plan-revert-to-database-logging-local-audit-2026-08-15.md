# Plan: Revert to Database Logging & Local Audit

Revert the contact form logic to focus on database storage and audit logging, removing the dependency on Lark Suite for notifications and emails as requested.

## User Review Required

> [!IMPORTANT]
> This plan removes the Lark Suite bot integration and reverts to the previously stable system of saving contacts to the database and logging actions for manual auditing.

- **Email Feedback**: Automated emails to customers will be disabled since they depended on the Lark integration.
- **Audit Logs**: The system will continue to log every submission in the `contact_audit_logs` table for your review.

## Proposed Changes

### Contact Logic
- Update `src/lib/contact.functions.ts` to remove calls to `lark.server.ts`.
- Maintain the Supabase storage logic for `contact_submissions`.
- Maintain audit logging in `contact_audit_logs` but with a status indicating local storage success.
- The `src/lib/lark.server.ts` file will remain for potential future use but will no longer be invoked.

## Technical Details

### `src/lib/contact.functions.ts`
- Clean up imports and the Lark integration block.
- Update `larkStatus` to `stored_locally`.
- Ensure `contact_audit_logs` captures that the submission was successful even without an external notification.

### `src/components/site/Contact.tsx`
- No changes needed here, as it calls `submitContactForm` which will handle the logic server-side.
