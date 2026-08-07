import { defineConfig } from "astro/config";

// The canonical origin. Used for <link rel="canonical"> and the Open Graph
// image URL, so it must be the real domain in production.
//
// CI sets SITE_URL; local builds fall back to the dev origin, which keeps
// `npm run build` working without anyone having to remember a flag.
const site = process.env.SITE_URL || "http://localhost:4321";

export default defineConfig({
  site,
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: false,
    },
  },
});
