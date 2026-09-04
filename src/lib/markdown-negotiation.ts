function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function textContent(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function estimateTokens(value: string): string {
  return String(Math.ceil(value.trim().split(/\s+/).filter(Boolean).length * 1.3));
}

export function htmlToMarkdown(html: string): { markdown: string; originalTokens: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const description = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
  )?.[1];
  const image = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*>/i,
  )?.[1];
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(header|footer|nav|aside|svg)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, content: string) => `${"#".repeat(Number(level))} ${textContent(content)}\n\n`)
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, content: string) => `[${textContent(content)}](${href})`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content: string) => `- ${textContent(content)}\n`)
    .replace(/<(p|section|article|div|main|form|ul|ol|br)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n\s*\n/)
    .map((part) => decodeEntities(part).replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");

  const frontmatter = [
    title && `title: "${escapeYaml(textContent(title))}"`,
    description && `description: "${escapeYaml(textContent(description))}"`,
    image && `image: "${escapeYaml(image)}"`,
  ].filter(Boolean);

  if (frontmatter.length > 0) body = `---\n${frontmatter.join("\n")}\n---\n\n${body}`;
  if (jsonLd.length > 0) body += "\n\n```json\n" + jsonLd.join("\n") + "\n```";

  return { markdown: `${body.trim()}\n`, originalTokens: estimateTokens(html) };
}

export function acceptsMarkdown(request: Request): boolean {
  return request.headers
    .get("Accept")
    ?.split(",")
    .some((value) => value.trim().split(";", 1)[0] === "text/markdown") ?? false;
}