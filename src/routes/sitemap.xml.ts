import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = 'https://quimeratech.pt';
        
        const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-legal.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

        return new Response(sitemapIndex, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      },
    },
  },
});
