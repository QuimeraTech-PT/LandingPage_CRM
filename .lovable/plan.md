# CRM Files Management Overhaul Plan

This plan implements file moving and batch actions for Google Drive integration, including full activity logging and user confirmations.

## Proposed Changes

### Backend Logic (`src/lib/google-drive.functions.ts`)

- **Add `moveDriveFile` server function**:
  - Moves a file by updating its `parents` field (removing the old one and adding the new one).
  - Logs the movement in `crm_activity_logs` with details (file name, source folder, destination folder).
- **Add `batchRenameDriveFiles` server function**:
  - Iterates through a list of files to rename them.
  - Logs each rename individually in activity logs.
- **Add `batchDeleteDriveFiles` server function**:
  - Iterates through a list of files to move them to trash.
  - Logs each deletion individually in activity logs.
- **Update `listProjectFiles`**:
  - Ensure it returns folder names and subfolders within the project folder to enable moving files between them.

### Frontend UI (`src/components/crm/ProjectFiles.tsx`)

- **Multi-select system**:
  - Add checkboxes to each file row.
  - Implement a "Selection Bar" that appears when one or more items are selected.
- **Batch Actions UI**:
  - "Batch Rename": A modal allowing users to see all selected files and provide new names.
  - "Batch Delete": A confirmation modal showing the list of files to be trashed.
- **Move Action UI**:
  - Individual "Move" action in the file dropdown.
  - Batch "Move" action in the selection bar.
  - A destination picker dialog that lists available folders within the project.
- **Real-time Feedback**:
  - Toast notifications for every step of batch processing.
  - Invalidation of React Query data to ensure the UI stays in sync.

## Technical Details

- **Google Drive API**: Use `files.update` with `addParents` and `removeParents` for moving.
- **State Management**: Use local React state for `selectedFiles` and `isSelectionMode`.
- **Error Handling**: Implement graceful degradation if secrets are missing or API calls fail during batch processing (report successful vs. failed items).

## User Impact

- Improved efficiency for managing multiple documents in large projects.
- Better organization by allowing file moves without leaving the CRM dashboard.
- Increased transparency through detailed activity logs for all file operations.
