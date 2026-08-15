import { createServerFn } from "@tanstack/react-start";
import { google, drive_v3 } from 'googleapis';
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const getDriveClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error("Credenciais do Google Drive não configuradas.");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  return google.drive({ version: 'v3', auth });
};

export const createProjectFolder = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    projectId: z.string(),
    clientName: z.string(),
    projectName: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

      const folderMetadata: drive_v3.Schema$File = {
        name: `${data.clientName} - ${data.projectName}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: rootFolderId ? [rootFolderId] : []
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      const folderId = folder.data.id;

      if (folderId) {
        await supabaseAdmin
          .from("crm_projects")
          .update({ google_drive_folder_id: folderId })
          .eq("id", data.projectId);
      }

      return { folderId };
    } catch (error) {
      console.error("Erro ao criar pasta no Drive:", error);
      throw new Error("Falha na integração com o Google Drive.");
    }
  });

export const listProjectFiles = createServerFn({ method: "GET" })
  .inputValidator((data: any) => z.object({
    folderId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      const response = await drive.files.list({
        q: `'${data.folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webViewLink, iconLink)',
      });

      return response.data.files || [];
    } catch (error) {
      console.error("Erro ao listar ficheiros do Drive:", error);
      return [];
    }
  });
