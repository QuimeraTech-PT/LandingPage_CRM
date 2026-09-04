import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap-legal.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://quimeratech.com/politica-de-privacidade</loc><lastmod>2026-09-03</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>https://quimeratech.com/politica-de-cookies</loc><lastmod>2026-09-03</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>https://quimeratech.com/termos-de-servico</loc><lastmod>2026-09-03</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});