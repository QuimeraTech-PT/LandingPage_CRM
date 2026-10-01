import { defineConfig } from "nitro";

export default defineConfig({
  cloudflare: {
    wrangler: {
      name: "landing",
      compatibility_date: "2026-09-05",
      workers_dev: true,
      preview_urls: true,
      routes: [
        { pattern: "quimeratech.com/*", zone_name: "quimeratech.com" },
        { pattern: "quimeratech.com", zone_name: "quimeratech.com" },
        {
          pattern: "quimeratech.com",
          zone_name: "quimeratech.com",
          custom_domain: true,
          enabled: true,
          previews_enabled: false,
        },
        {
          pattern: "www.quimeratech.com",
          zone_name: "quimeratech.com",
          custom_domain: true,
          enabled: true,
          previews_enabled: false,
        },
      ],
    },
  },
});
