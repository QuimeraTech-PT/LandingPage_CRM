import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sitemap-pages/xml')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = 'https://quimeratech.pt';
        const pages = [
          { url: '/', lastmod: '2026-08-18', changefreq: 'weekly', priority: 1.0 },
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      },
    },
  },
});
