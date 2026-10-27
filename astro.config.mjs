import { defineConfig } from "astro/config";

// The canonical origin. Used for <link rel="canonical"> and the Open Graph
// image URL, so it must be the real domain in production.
//
// CI sets SITE_URL; local builds fall back to the dev origin, which keeps
// `npm run build` working without anyone having to remember a flag.
const site = process.env.SITE_URL || "http://localhost:4321";

export default defineConfig({
  site,
  vite: {
    build: {
      // Keep every <script> an external file. Astro inlines small hoisted
      // scripts by default, and the production CSP is `script-src 'self'`
      // (deploy/nginx/orrin-headers.conf), which blocks an inline module
      // outright — so the nav toggle, the copy buttons and the backdrop
      // would all silently do nothing in production.
      assetsInlineLimit: 0,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: false,
    },
  },
});
