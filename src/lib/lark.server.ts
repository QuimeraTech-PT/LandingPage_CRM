
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
  data: any;
}

/**
 * Obtains a tenant_access_token from Lark.
 * Requires LARK_APP_ID and LARK_APP_SECRET environment variables.
 */
async function getTenantAccessToken(): Promise<string> {
  const appId = process.env['LARK_APP_ID'];
  const appSecret = process.env['LARK_APP_SECRET'];

  if (!appId || !appSecret) {
    throw new Error("LARK_APP_ID or LARK_APP_SECRET is not configured.");
  }

  const response = await fetch("https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

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
export async function sendLarkContactNotification(chatId: string, contactData: {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}) {
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

    const response = await fetch(`https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id`, {
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
    });

    const result = (await response.json()) as LarkMessageResponse;

    if (result.code !== 0) {
      throw new Error(`Lark Message Error: ${result.msg} (code: ${result.code})`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to send Lark notification:", error.message);
    throw error;
  }
}

/**
 * Placeholder for Lark Email API integration.
 */
export async function sendLarkEmailFeedback(email: string, nome: string) {
  // Logic to be implemented when Lark Mail permissions are active
  console.log(`[Lark Mail Placeholder] Sending email to ${email} for ${nome}`);
  return { success: true, simulated: true };
}
