/* =============================================================================
 * home.ts — every word on the landing page
 * =============================================================================
 * The landing page (src/pages/index.astro) renders this file and nothing else.
 * To change the page's copy, change it here. You never need to open the .astro
 * file to edit text.
 *
 * Shape of the page, top to bottom:
 *
 *   hero          the headline, the paragraph under it, the buttons
 *   quickstart    the terminal block beside the hero
 *   showcase      the big screenshot and its heading
 *   pillars       the three-up card band
 *   features      the alternating text/proof sections  (add or remove freely)
 *   status        the "where the project actually is" block
 *   closer        the last call to action
 *
 * `pillars.items` and `features` are both lists: add an entry and it appears,
 * delete one and it goes away. Nothing else needs touching.
 * ========================================================================== */

import { site } from "./site";

/* -----------------------------------------------------------------------------
 * Screenshots
 * -----------------------------------------------------------------------------
 * Drop a capture into public/shots/ and point `src` at it. `w` and `h` must be
 * the file's real pixel size — they reserve the aspect ratio so the page
 * doesn't jump while the image loads. Leave `src` out to render a labelled
 * placeholder at the right size instead of a broken image.
 *
 * These are window captures with transparent corners and their own drop
 * shadow, so nothing on the page frames them — see Shot.astro.
 * -------------------------------------------------------------------------- */

export const shots = {
  editor: {
    src: "/shots/Editor.webp",
    w: 2000,
    h: 1192,
    alt: "The Orrin editor: a hierarchy of 139 entities on the left, a viewport of glass and metal spheres over a grid of textured cubes lit by a blue point light, and an inspector on the right showing that light's colour, 8000 lm power and 10 m range.",
  },
  scripts: {
    src: "/shots/Scripts.png",
    w: 618,
    h: 386,
    alt: "Orrin's Scripts panel: a “Reload scripts” button, “Reload after a successful rebuild” ticked, and the status line “Watching for script changes.”",
  },
  sponza: {
    src: "/shots/Sponza.webp",
    w: 2000,
    h: 1192,
    alt: "Sponza rendered in Orrin: sunlight through the colonnade, volumetric haze down the nave, and coloured drapes hanging between the arches.",
  },
};

/* -----------------------------------------------------------------------------
 * Hero
 * -------------------------------------------------------------------------- */

export const hero = {
  /** The headline. Wrap a few words in *asterisks* to tint them with the
   *  accent colour — delete the asterisks to drop the tint. */
  title: "A fast, *fit to purpose* engine.",

  lede: "Orrin is a new, open-source game engine for 3D games (2D planned for the future) for all kinds of fidelity. Orrin is built to allow you to purpose the game engine to your specific needs, and to be fast when editing, coding or publishing.",

  actions: [
    { href: "/docs/getting-started/", label: "Get started", primary: true },
    { href: site.repo, label: "View source", primary: false },
  ],
};

/** The terminal block beside the headline. Lines starting with "#" render as
 *  comments; everything else gets a `$` prompt and goes on the clipboard when
 *  someone hits Copy. */
export const quickstart = {
  label: "quick start",
  lines: [
    "# Run the engine on its built-in demo",
    "cargo run -p orrin-core",
    "",
    "# Or scaffold a project with the CLI",
    "cargo build -p orrin-cli",
    "./target/debug/orrin new my-game",
  ],
};

/* -----------------------------------------------------------------------------
 * Showcase — the wide screenshot under the hero
 * -------------------------------------------------------------------------- */

export const showcase = {
  heading: "The editor",
  shot: shots.editor,
};

/* -----------------------------------------------------------------------------
 * Pillars — the three-up card band under the screenshot
 * -----------------------------------------------------------------------------
 * A list. Add a fourth and the grid takes it; drop to two and they widen.
 * Keep each `body` to one sentence — these are cards, not paragraphs.
 * -------------------------------------------------------------------------- */

export const pillars = {
  heading: "A different way to make games",

  items: [
    {
      title: "Clean design",
      body: "Orrin's design provides a smooth and fast experience to create.",
      shot: shots.editor,
    },
    {
      title: "Test on the go",
      body: "Be able to change your code while testing and see the changes live.",
      shot: shots.scripts,
    },
    {
      title: "Fast and powerful 3D",
      body: "Orrin's renderer is both fast and capable, giving you the power to build, animate and render your 3D worlds.",
      shot: shots.sponza,
    },
  ],
};

/* -----------------------------------------------------------------------------
 * Features — the alternating sections under the pillars
 * -----------------------------------------------------------------------------
 * Two kinds of proof panel:
 *
 *   { kind: "rows",  rows: [{ k, v, tag? }] }   a small spec table
 *   { kind: "shot",  shot: shots.x, note }      a screenshot with a caption
 *
 * `tag` puts a small pill after the value — use it to mark something as not
 * yet shipped, so the page can't be read as promising more than exists.
 *
 * This list is currently one entry. Add another and it lays out on the
 * opposite side automatically.
 * -------------------------------------------------------------------------- */

type Rows = {
  kind: "rows";
  rows: { k: string; v: string; tag?: string }[];
};

type ShotBlock = {
  kind: "shot";
  shot: (typeof shots)[keyof typeof shots];
  note: string;
};

export type Feature = {
  heading: string;
  body: string;
  /** Optional. Leave it out and the section is heading and prose alone. */
  link?: { href: string; label: string };
  /** Optional. Without it the text runs the full width of the section. */
  proof?: Rows | ShotBlock;
};

export const features: Feature[] = [
  {
    heading: "Open source",
    body: "Orrin is a full open-source game engine, allowing anyone to contribute or fork this engine. However, this does make development harder for me, so I do hope you or others can help to contribute.",
  },
];

/* -----------------------------------------------------------------------------
 * Status — the honest band near the bottom
 * -------------------------------------------------------------------------- */

export const status = {
  heading: "Where the project actually is",
  /** One string per paragraph. Markdown links — [text](href) — work here. */
  paragraphs: [
    "As of late October 2026, the engine has come pretty far since starting in June of this year. The forward 3D renderer is almost complete, with just a couple more features and optimizations to do.",
    "The C# scripting is in a solid state — you can live edit your games, with a fully functional ABI that gains more capabilities as the engine progresses.",
    "However this engine is not in a state where I'd suggest making your own games. There are many core features that are just required, like exporting your game!",
    "The possible future contributors and I are trying to get this engine into a state of rivalry against other engines.",
  ],
};

/* -----------------------------------------------------------------------------
 * Closer
 * -------------------------------------------------------------------------- */

/**
 * The closing call to action. `action` is optional — drop it and the section
 * ends on the paragraph. Typed rather than inferred so that removing it keeps
 * the page compiling; see the note on RoadmapPage in roadmap.ts.
 */
export const closer: {
  heading: string;
  body: string;
  action?: { href: string; label: string };
} = {
  heading: "Start with the demo scene",
  body: "One `cargo run` gets the engine up on its built-in demo. The CLI scaffolds a project with a manifest, a `.csproj` and an entry Behaviour, so you don't have to learn the workspace layout first.",
  action: { href: "/docs/getting-started/", label: "Get started" },
};
