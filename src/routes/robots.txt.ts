import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/robots/txt')({
  server: {
    handlers: {
      GET: async () => {
        const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://quimeratech.pt/sitemap.xml
Sitemap: https://quimeratech.pt/sitemap-pages.xml
Sitemap: https://quimeratech.pt/sitemap-legal.xml`;

        return new Response(robots, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      },
    },
  },
});
