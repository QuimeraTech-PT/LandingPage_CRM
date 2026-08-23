/**
 * Lark Suite (Feishu) Integration Helper
 * Used to communicate with Lark Open Platform APIs.
 */

interface LarkTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

interface LarkMessageResponse {
  code: number;
  msg: string;
  data: unknown;
}

/**
 * Obtains a tenant_access_token from Lark.
 * Requires LARK_APP_ID and LARK_APP_SECRET environment variables.
 */
async function getTenantAccessToken(): Promise<string> {
  const appId = process.env["LARK_APP_ID"];
  const appSecret = process.env["LARK_APP_SECRET"];

  if (!appId || !appSecret) {
    throw new Error("LARK_APP_ID or LARK_APP_SECRET is not configured.");
  }

  const response = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    },
  );

  const data = (await response.json()) as LarkTokenResponse;

  if (data.code !== 0) {
    throw new Error(`Lark Auth Error: ${data.msg} (code: ${data.code})`);
  }

  return data.tenant_access_token;
}

/**
 * Sends a card message to a Lark chat group.
 * @param chatId The receive_id (chat_id) of the group.
 * @param content The contact form data.
 */
export async function sendLarkContactNotification(
  chatId: string,
  contactData: {
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
  },
) {
  try {
    const token = await getTenantAccessToken();

    // Construct a beautiful Interactive Card message
    const card = {
      config: {
        wide_screen_mode: true,
      },
      header: {
        title: {
          tag: "plain_text",
          content: "🚀 Novo Contacto: " + contactData.assunto,
        },
        template: "blue",
      },
      elements: [
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Nome:**\n${contactData.nome}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Email:**\n${contactData.email}`,
              },
            },
          ],
        },
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `**Mensagem:**\n${contactData.mensagem}`,
          },
        },
        {
          tag: "hr",
        },
        {
          tag: "note",
          elements: [
            {
              tag: "plain_text",
              content: "Enviado via QuimeraTech Website",
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receive_id: chatId,
          msg_type: "interactive",
          content: JSON.stringify(card),
        }),
      },
    );

    const result = (await response.json()) as LarkMessageResponse;

    if (result.code !== 0) {
      throw new Error(`Lark Message Error: ${result.msg} (code: ${result.code})`);
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to send Lark notification:", errorMessage);
    throw error;
  }
}

/**
 * Sends a feedback email using Lark's Public Mailbox API.
 * Requires LARK_PUBLIC_MAILBOX_EMAIL environment variable.
 */
export async function sendLarkEmailFeedback(
  customerEmail: string,
  customerName: string,
  subject: string,
) {
  const publicMailbox = process.env["LARK_PUBLIC_MAILBOX_EMAIL"];

  if (!publicMailbox) {
    console.warn("LARK_PUBLIC_MAILBOX_EMAIL is not configured. Email feedback skipped.");
    return { success: false, reason: "missing_config" };
  }

  try {
    const token = await getTenantAccessToken();

    // Using Lark's mail.v1.public_mailbox.message.send endpoint
    // Note: This is a simplified representation of the Public Mailbox Send API
    const response = await fetch(
      `https://open.larksuite.com/open-apis/mail/v1/public_mailboxes/${publicMailbox}/messages/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: `Re: ${subject} - QuimeraTech`,
          content: `Olá ${customerName},\n\nObrigado pelo seu contacto. Recebemos a sua mensagem com sucesso e a nossa equipa irá analisá-la brevemente.\n\nCom os melhores cumprimentos,\nEquipa QuimeraTech`,
          to_address: customerEmail,
        }),
      },
    );

    const result = (await response.json()) as LarkMessageResponse;

    if (result.code !== 0) {
      console.error(`Lark Mail Error: ${result.msg} (code: ${result.code})`);
      return { success: false, error: result.msg };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to send Lark email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
