/* =============================================================================
 * site.ts — the things that appear on every page
 * =============================================================================
 * Brand name, navigation, links, footer. Change a label or a URL here and it
 * updates everywhere at once: the nav, the mobile menu, the footer and the 404.
 *
 * Nothing in this file is markup. It is safe to edit the text inside quotes.
 * ========================================================================== */

export const site = {
  /** Shown in the nav, the footer, and appended to every page title. */
  name: "Orrin",

  /** A one-liner for prose. Deliberately NOT in the <title> — a link preview
   *  truncates anything past about 60 characters, which ate the old one. */
  tagline: "An open-source 3D game engine you can cut down to the game you're making.",

  /**
   * The home page's <meta description>, and the fallback for any page that
   * doesn't set its own. This is the paragraph people see in a link preview
   * on Discord, Slack or a search result, so keep it to a few sentences —
   * most clients cut it off around 300 characters.
   *
   * The hero on the landing page renders this same string, so the page and
   * the preview can't say different things.
   */
  description:
    "Orrin is a new, open-source game engine for 3D games (2D planned for the future) for all kinds of fidelity. Orrin is built to allow you to purpose the game engine to your specific needs, and to be fast when editing, coding or publishing.",

  repo: "https://github.com/Orrin-Team/orrin",
  discord: "https://discord.gg/sY8YBGFmRy",
  licence: "GPL-2.0",
} as const;

/* -----------------------------------------------------------------------------
 * Primary navigation
 * -------------------------------------------------------------------------- */

export type NavLink = {
  href: string;
  label: string;
  /** Any page whose path starts with this string marks the link as current. */
  match?: string;
};

export const navLinks: NavLink[] = [
  { href: "/docs/getting-started/", label: "Docs", match: "/docs" },
  { href: "/roadmap/", label: "Roadmap", match: "/roadmap" },
  { href: "/blog/", label: "Blog", match: "/blog" },
];

/** The filled button on the right of the nav. */
export const navCta = { href: "/docs/getting-started/", label: "Get started" };

/* -----------------------------------------------------------------------------
 * Footer
 * -------------------------------------------------------------------------- */

export const footer = {
  links: [
    { href: "/docs/getting-started/", label: "Docs" },
    { href: "/roadmap/", label: "Roadmap" },
    { href: "/blog/", label: "Blog" },
    { href: site.repo, label: "GitHub" },
    { href: site.discord, label: "Discord" },
  ],
};
