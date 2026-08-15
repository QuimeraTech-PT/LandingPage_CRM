import { createServerFn } from "@tanstack/react-start";
import { google } from 'googleapis';
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Nota: O utilizador precisa de configurar estes segredos via add_secret
// GOOGLE_SERVICE_ACCOUNT_EMAIL
// GOOGLE_PRIVATE_KEY
// GOOGLE_DRIVE_ROOT_FOLDER_ID (Pasta QuimeraTech/Clientes)

const getDriveClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error("Credenciais do Google Drive não configuradas.");
  }

  const auth = new google.auth.JWT(
    email,
    null,
    key,
    ['https://www.googleapis.com/auth/drive.file']
  );

  return google.drive({ version: 'v3', auth });
};

export const createProjectFolder = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { projectId: string; clientName: string; projectName: string } }) => {
    try {
      const drive = getDriveClient();
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

      // 1. Criar pasta do Cliente se não existir
      // (Para simplicidade neste MVP, criamos uma pasta para cada projeto dentro da raiz configurada)
      const folderMetadata = {
        name: `${data.clientName} - ${data.projectName}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: rootFolderId ? [rootFolderId] : []
      };

      const folder = await drive.files.create({
        // @ts-ignore
        resource: folderMetadata,
        fields: 'id',
      });

      const folderId = folder.data.id;

      // 2. Atualizar o projeto na base de dados
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
  .handler(async ({ data }: { data: { folderId: string } }) => {
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
