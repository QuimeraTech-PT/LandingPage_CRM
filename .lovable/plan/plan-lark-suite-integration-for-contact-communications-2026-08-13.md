# Plan: Lark Suite Integration for Contact Communications

Implement the technical architecture to integrate Lark Suite (Feishu) for handling contact form communications, specifically for sending internal notifications to a chat group and preparing for email delivery.

## User Review Required

> [!IMPORTANT]
> To complete the integration, you will need to provide the `LARK_APP_ID` and `LARK_APP_SECRET` from your Lark Open Platform console. I will implement the code to use these secrets once provided.

- **Lark App Type**: "Custom App" (Web App / Bot).
- **Permissions needed**: `im:message` (to send group messages), `mail:mail` (if using Lark's email API).
- **Architecture**: The integration will use a server-side authentication flow to obtain a `tenant_access_token` and then call Lark's OpenAPI endpoints.

## Proposed Changes

### Backend (Server Functions)

#### [NEW] `src/lib/lark.server.ts`
- Create helper functions to interact with Lark API.
- Function to get `tenant_access_token` using `LARK_APP_ID` and `LARK_APP_SECRET`.
- Function to send a message to a specific chat group (using `receive_id` or webhook).
- Function to send an email (as a placeholder for when email permissions are active).

#### [MODIFY] `src/lib/contact.functions.ts`
- Integrate the Lark helpers into the `submitContactForm` handler.
- After saving to the database, trigger a Lark notification to the team.
- Update the audit log with Lark-specific status.

### Security and Infrastructure

- Use `supabaseAdmin` for database operations (already exists).
- Read Lark secrets from environment variables (to be added via `add_secret`).

## Technical Details

- **Lark API Auth**: POST `https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal`.
- **Message Send**: POST `https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id`.
- **Error Handling**: Implement graceful fallback so that if Lark is down, the contact is still saved to Supabase.
