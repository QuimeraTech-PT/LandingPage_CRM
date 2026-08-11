import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/robots/txt')({
  server: {
    handlers: {
      GET: async () => {
        const robots = `User-agent: *
Allow: /
Sitemap: https://quimeratech.pt/sitemap.xml`;

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
