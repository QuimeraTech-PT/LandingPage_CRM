# Implementation Plan - Enhanced CRM File Explorer

Improve accessibility, expand file previews, and implement retry logic for batch operations.

## User Review Required

> [!IMPORTANT]
> Google Docs/Sheets/Slides previews will use the Google Drive embedded viewer (`/preview` endpoint). Some enterprise or restricted files may require the user to be logged into Google in the same browser session to render successfully.

- **Accessibility**: Are there specific screen reader behaviors or keyboard shortcuts preferred? (Defaulting to standard ARIA live regions and focus management).
- **Retry Logic**: Should retries be limited to a certain number of attempts? (Defaulting to manual one-click retry for all failed items).

## Proposed Changes

### CRM & Google Drive Integration

#### [Backend] Expanded File Support & Error Details
- Update `batchMoveDriveFiles` in `src/lib/google-drive.functions.ts` to return the original move parameters in the result object for failed items to facilitate retries.
- Ensure file metadata includes necessary flags for identifying Google Workspace documents.

#### [Frontend] Accessibility & Progress UI
- **ARIA Integration**: Add `aria-live="polite"` regions for progress updates and `aria-busy` for loading states.
- **Enhanced Status Indicators**: Update the status list with descriptive labels and distinct visual cues (icons + colors) for each state (Queued, In Progress, Success, Error).
- **Keyboard Navigation**: Ensure the progress dialog captures focus and allows closing with `Esc`.

#### [Frontend] Expanded Inline Preview
- **Google Workspace Docs**: Detect `application/vnd.google-apps.*` mime types.
- **Embedded Viewer**: Use the Google Drive `/preview` URL in an iframe for Docs, Sheets, and Slides.
- **External Action**: Add a prominent "Open in New Tab" button specifically for Workspace files.

#### [Frontend] Batch Retry Logic
- **Retry Mechanism**: Implement `handleRetryFailedMoves` which filters `batchMoveProgress.results` for failures and re-triggers the `batchMoveMutation`.
- **UI Trigger**: Add a "Retry Failed" button in the batch results dialog, visible only if errors occurred.

## Technical Details

### File Preview Mapping
```typescript
const isWorkspaceFile = (mimeType: string) => mimeType.startsWith('application/vnd.google-apps.');
const getPreviewUrl = (file: any) => {
  if (isWorkspaceFile(file.mimeType)) return file.webViewLink.replace('/view', '/preview');
  if (file.mimeType === 'application/pdf') return file.webViewLink.replace('/view', '/preview');
  // ... existing image logic
};
```

### Batch Progress State Update
```typescript
// New state structure
const [batchMoveProgress, setBatchMoveProgress] = useState<{
  current: number;
  total: number;
  results: Array<{
    fileId: string;
    fileName: string;
    oldParentId: string;
    newParentId: string;
    success: boolean;
    error?: string;
    status: 'queued' | 'processing' | 'success' | 'error';
  }>;
} | null>(null);
```
