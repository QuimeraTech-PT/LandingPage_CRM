import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { acceptsMarkdown, htmlToMarkdown } from "./lib/markdown-negotiation";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function negotiateMarkdown(request: Request, response: Response): Promise<Response> {
  if (!acceptsMarkdown(request)) return response;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;

  const html = await response.text();
  const { markdown, originalTokens } = htmlToMarkdown(html);
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  headers.set("x-original-tokens", originalTokens);
  headers.set(
    "x-markdown-tokens",
    String(Math.ceil(markdown.split(/\s+/).filter(Boolean).length * 1.3)),
  );
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");
  return new Response(markdown, { status: response.status, headers });
}

function addHomepageLinkHeaders(request: Request, response: Response): Response {
  if (new URL(request.url).pathname !== "/") return response;

  const headers = new Headers(response.headers);
  const links = [
    '</.well-known/api-catalog>; rel="api-catalog"',
    '</.well-known/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.0"',
    '</>; rel="service-doc"; type="text/html"',
    '</llms.txt>; rel="describedby"; type="text/plain"',
  ];
  headers.append("Link", links.join(", "));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function createCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

async function addSecurityHeaders(response: Response): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  const isHtml = (headers.get("content-type") ?? "").includes("text/html");
  const nonce = isHtml ? createCspNonce() : undefined;
  const scriptSource = nonce ? `'nonce-${nonce}' 'strict-dynamic'` : "'self'";
  headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src ${scriptSource} 'sha256-/41pF9u1laVVK9oDKU5Ggxx5qOQGuoGf/RmXC9FOc5A=' 'sha256-NEQyMawf/TgZL8zDfyYBPPezU30xErihypeIb7JdGHE='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'`,
  );
  if (!nonce) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const html = await response.text();
  const htmlWithNonce = html.replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`);
  headers.delete("Content-Length");
  return new Response(htmlWithNonce, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const requestForRendering = acceptsMarkdown(request)
        ? new Request(request, {
            headers: { ...Object.fromEntries(request.headers), Accept: "text/html" },
          })
        : request;
      const response = await handler.fetch(requestForRendering, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      const securedResponse = await addSecurityHeaders(
        addHomepageLinkHeaders(request, normalizedResponse),
      );
      return await negotiateMarkdown(request, securedResponse);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
