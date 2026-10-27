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

  /** The one-line description search engines and link previews use. */
  tagline: "An open-source 3D game engine you can cut down to the game you're making.",

  /** Fallback <meta description> for any page that doesn't set its own. */
  description:
    "Orrin is an open-source 3D game engine written in Rust with C# scripting hosted in-process. Change code and see the result in under two seconds, and build with only the subsystems your game needs.",

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
