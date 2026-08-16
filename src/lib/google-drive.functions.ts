import { createServerFn } from "@tanstack/react-start";
import { google, drive_v3 } from 'googleapis';
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const getDriveClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    console.warn("Google Drive: Credenciais não encontradas no ambiente.");
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return google.drive({ version: 'v3', auth });
  } catch (e) {
    console.error("Google Drive: Erro ao inicializar cliente JWT:", e);
    return null;
  }
};

export const createProjectFolder = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    projectId: z.string(),
    clientName: z.string(),
    projectName: z.string()
  }).parse(data))
  .handler(async ({ data, context }: { data: any, context: any }) => {
    const userId = context?.userId;
    if (!userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    // Internal helper for logging since we can't easily share the one in crm.functions due to circular imports
    const logDriveActivity = async (action: string, details: any, status: 'success' | 'failure' | 'warning' = 'success') => {
      try {
        await supabaseAdmin
          .from("crm_activity_logs")
          .insert([{
            user_id: userId,
            action,
            entity_type: 'drive',
            entity_id: data.projectId,
            details,
            status
          }]);
      } catch (e) {
        console.error("Log Drive failure:", e);
      }
    };

    try {
      const drive = getDriveClient();
      if (!drive) {
        await logDriveActivity('create_folder_failure', { error: 'Missing secrets' }, 'failure');
        return { error: "Drive não configurado", status: "pending_config" };
      }

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
  .handler(async ({ data, context }: { data: any, context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    try {
      const drive = getDriveClient();
      if (!drive) {
        return { error: "Drive não configurado", status: "pending_config", files: [] };
      }

      const response = await drive.files.list({
        q: `'${data.folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webViewLink, iconLink, size, modifiedTime)',
      });

      return { files: response.data.files || [], status: "success" };
    } catch (error) {
      console.error("Erro ao listar ficheiros do Drive:", error);
      return { files: [], status: "error", error: "Erro na API do Drive" };
    }
  });
