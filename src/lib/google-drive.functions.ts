import { createServerFn } from "@tanstack/react-start";
import { google, drive_v3 } from "googleapis";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { z } from "zod";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro desconhecido";

const getDriveClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    console.warn("Google Drive: Credenciais não encontradas no ambiente.");
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    return google.drive({ version: "v3", auth });
  } catch (e) {
    console.error("Google Drive: Erro ao inicializar cliente JWT:", e);
    return null;
  }
};

export const createProjectFolder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        clientName: z.string(),
        projectName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const logDriveActivity = async (
      action: string,
      details: Json,
      status: "success" | "failure" | "warning" = "success",
    ) => {
      try {
        await supabaseAdmin.from("crm_activity_logs").insert([
          {
            action,
            entity_type: "drive",
            entity_id: data.projectId,
            details,
            status,
          },
        ]);
      } catch (e) {
        console.error("Log Drive failure:", e);
      }
    };

    try {
      const drive = getDriveClient();
      if (!drive) {
        await logDriveActivity("create_folder_failure", { error: "Missing secrets" }, "failure");
        return { error: "Drive não configurado", status: "pending_config" };
      }

      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

      const folderMetadata: drive_v3.Schema$File = {
        name: `${data.clientName} - ${data.projectName}`,
        mimeType: "application/vnd.google-apps.folder",
        parents: rootFolderId ? [rootFolderId] : [],
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      const folderId = folder.data.id;

      if (folderId) {
        await supabaseAdmin
          .from("crm_projects")
          .update({ google_drive_folder_id: folderId })
          .eq("id", data.projectId);

        await logDriveActivity("create_folder_success", { folderId });
      }

      return { folderId };
    } catch (error: unknown) {
      console.error("Erro ao criar pasta no Drive:", error);
      await logDriveActivity("create_folder_error", { error: getErrorMessage(error) }, "failure");
      throw new Error("Falha na integração com o Google Drive.");
    }
  });

export const listProjectFiles = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        folderId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) {
        return { error: "Drive não configurado", status: "pending_config", files: [] };
      }

      const response = await drive.files.list({
        q: `'${data.folderId}' in parents and trashed = false`,
        fields:
          "files(id, name, mimeType, webViewLink, iconLink, size, modifiedTime, thumbnailLink)",
      });

      return { files: response.data.files || [], status: "success" };
    } catch (error) {
      console.error("Erro ao listar ficheiros do Drive:", error);
      return { files: [], status: "error", error: "Erro na API do Drive" };
    }
  });

export const uploadFileToProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        folderId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileContent: z.string(), // base64
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      const buffer = Buffer.from(data.fileContent, "base64");
      const fileMetadata = {
        name: data.fileName,
        parents: [data.folderId],
      };

      const { Readable } = await import("stream");
      const media = {
        mimeType: data.fileType,
        body: Readable.from(buffer),
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      await supabaseAdmin.from("crm_activity_logs").insert([
        {
          action: "upload_file",
          entity_type: "drive",
          entity_id: data.projectId,
          details: { fileName: data.fileName, fileId: file.data.id },
          status: "success",
        },
      ]);

      return { success: true, fileId: file.data.id, link: file.data.webViewLink };
    } catch (error: unknown) {
      console.error("Upload error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const renameDriveFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        fileId: z.string(),
        newName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      await drive.files.update({
        fileId: data.fileId,
        requestBody: { name: data.newName },
      });

      await supabaseAdmin.from("crm_activity_logs").insert([
        {
          action: "rename_file",
          entity_type: "drive",
          entity_id: data.projectId,
          details: { fileId: data.fileId, newName: data.newName },
          status: "success",
        },
      ]);

      return { success: true };
    } catch (error: unknown) {
      console.error("Rename error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const deleteDriveFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        fileId: z.string(),
        fileName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      await drive.files.update({
        fileId: data.fileId,
        requestBody: { trashed: true },
      });

      await supabaseAdmin.from("crm_activity_logs").insert([
        {
          action: "delete_file",
          entity_type: "drive",
          entity_id: data.projectId,
          details: { fileId: data.fileId, fileName: data.fileName },
          status: "success",
        },
      ]);

      return { success: true };
    } catch (error: unknown) {
      console.error("Delete error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const moveDriveFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        fileId: z.string(),
        fileName: z.string(),
        oldParentId: z.string(),
        newParentId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      await drive.files.update({
        fileId: data.fileId,
        addParents: data.newParentId,
        removeParents: data.oldParentId,
      });

      await supabaseAdmin.from("crm_activity_logs").insert([
        {
          action: "move_file",
          entity_type: "drive",
          entity_id: data.projectId,
          details: {
            fileId: data.fileId,
            fileName: data.fileName,
            oldParentId: data.oldParentId,
            newParentId: data.newParentId,
          },
          status: "success",
        },
      ]);

      return { success: true };
    } catch (error: unknown) {
      console.error("Move error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const batchRenameDriveFiles = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        files: z.array(
          z.object({
            fileId: z.string(),
            newName: z.string(),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      const results = [];
      for (const file of data.files) {
        try {
          await drive.files.update({
            fileId: file.fileId,
            requestBody: { name: file.newName },
          });
          await supabaseAdmin.from("crm_activity_logs").insert([
            {
              action: "rename_file",
              entity_type: "drive",
              entity_id: data.projectId,
              details: { fileId: file.fileId, newName: file.newName },
              status: "success",
            },
          ]);
          results.push({ fileId: file.fileId, success: true });
        } catch (error: unknown) {
          results.push({ fileId: file.fileId, success: false, error: getErrorMessage(error) });
        }
      }

      return { success: true, results };
    } catch (error: unknown) {
      console.error("Batch rename error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const batchDeleteDriveFiles = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        files: z.array(
          z.object({
            fileId: z.string(),
            fileName: z.string(),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      const results = [];
      for (const file of data.files) {
        try {
          await drive.files.update({
            fileId: file.fileId,
            requestBody: { trashed: true },
          });
          await supabaseAdmin.from("crm_activity_logs").insert([
            {
              action: "delete_file",
              entity_type: "drive",
              entity_id: data.projectId,
              details: { fileId: file.fileId, fileName: file.fileName },
              status: "success",
            },
          ]);
          results.push({ fileId: file.fileId, success: true });
        } catch (error: unknown) {
          results.push({ fileId: file.fileId, success: false, error: getErrorMessage(error) });
        }
      }

      return { success: true, results };
    } catch (error: unknown) {
      console.error("Batch delete error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });

export const batchMoveDriveFiles = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string(),
        newParentId: z.string(),
        files: z.array(
          z.object({
            fileId: z.string(),
            fileName: z.string(),
            oldParentId: z.string(),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const drive = getDriveClient();
      if (!drive) throw new Error("Drive não configurado");

      const results = [];
      for (const file of data.files) {
        try {
          await drive.files.update({
            fileId: file.fileId,
            addParents: data.newParentId,
            removeParents: file.oldParentId,
          });
          await supabaseAdmin.from("crm_activity_logs").insert([
            {
              action: "move_file",
              entity_type: "drive",
              entity_id: data.projectId,
              details: {
                fileId: file.fileId,
                fileName: file.fileName,
                oldParentId: file.oldParentId,
                newParentId: data.newParentId,
              },
              status: "success",
            },
          ]);
          results.push({ fileId: file.fileId, success: true });
        } catch (error: unknown) {
          results.push({ fileId: file.fileId, success: false, error: getErrorMessage(error) });
        }
      }

      return { success: true, results };
    } catch (error: unknown) {
      console.error("Batch move error:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  });