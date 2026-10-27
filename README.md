# Orrin Engine — website

Static site for [Orrin](https://github.com/Orrin-Team/orrin), built with Astro.
No runtime, no client framework. The only JavaScript that ships is the backdrop
animation, the nav, and the copy-to-clipboard buttons.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview
npm run check    # type-check the templates against src/data/
```

`npm run check` matters more than it looks. `astro build` does **not**
type-check: a template reading a field you have since deleted from a data file
builds happily and then throws when the page is requested. `npm run check`
catches that, and CI runs it before every deploy. If you remove a field from
`src/data/`, run it.

## Editing the content

**All the site's copy lives in `src/data/` and `src/content/`. You should never
need to open a `.astro` file to change what a page says.**

| What you want to change | File |
| --- | --- |
| Site name, nav links, footer, GitHub/Discord URLs | [`src/data/site.ts`](src/data/site.ts) |
| Every word on the landing page | [`src/data/home.ts`](src/data/home.ts) |
| The roadmap milestones | [`src/data/roadmap.ts`](src/data/roadmap.ts) |
| Documentation pages | `src/content/docs/*.md` |
| Blog posts | `src/content/blog/*.md` |

One page is **not** edited by hand:
[`src/content/docs/api-reference.md`](src/content/docs/api-reference.md) is
generated from the engine's own doc comments. See
[Refreshing the API reference](#refreshing-the-api-reference).

Each data file is commented with what every field does. They're TypeScript, so
a typo in a field name is a build error rather than a page that silently
renders nothing — but the values themselves are plain strings. Edit the text
between the quotes.

### Inline formatting inside data files

Data strings are plain text, so they can't carry a tag. Three markdown-shaped
forms work instead, and nothing else:

```ts
title: "Make the engine *yours*."          // *…* → the accent-tinted run
body:  "Discussion happens on [Discord](https://discord.gg/sY8YBGFmRy).",
body:  "One `cargo run` starts the demo.",  // `…` → inline monospace
```

Everything else is escaped, so a stray `<` or `&` in your copy is safe. The
rules live in [`src/lib/inline.ts`](src/lib/inline.ts).

### Adding a landing-page section

Two lists in [`src/data/home.ts`](src/data/home.ts) grow the page.

`pillars.items` is the three-up card band. Add a fourth card and the grid takes
it; drop to two and they widen. One sentence each — they're cards, not
paragraphs.

```ts
{ title: "Clean design", body: "Orrin's design provides a smooth and fast experience to create." }
```

`features` is the alternating full-width sections. Add an entry and a new one
appears on the opposite side automatically. Each carries either a small spec
table or a screenshot:

```ts
{
  heading: "Only the engine you actually use",
  body: "…",
  link: { href: "/roadmap/", label: "See what's shipped" },
  proof: {
    kind: "rows",
    rows: [
      { k: "Scope", v: "3D first.", tag: "Not shipped" },  // tag is optional
    ],
  },
}
```

`tag` renders a small amber pill after the value. Use it wherever the page
would otherwise read as promising something that isn't built yet.

### Screenshots

Drop the capture into `public/shots/` and point a `shots` entry in
[`src/data/home.ts`](src/data/home.ts) at it. `w`/`h` must be the file's real
pixel size — they reserve the aspect ratio, so the page doesn't jump as the
image loads. A slot with no `src` renders a labelled placeholder at the right
size instead of a broken image.

### Adding a doc page

Drop a `.md` file in `src/content/docs/`. The sidebar and the prev/next links
pick it up from `order:`.

```yaml
---
title: Rendering
description: One sentence, used in the page head and the docs index.
order: 5
---
```

### Adding a blog post

Drop a `.md` file in `src/content/blog/`. A `cover` has to live next to the
post in `src/`, not in `public/`, so Astro can optimise it — and `coverAlt` is
required whenever `cover` is set, or the build fails.

```yaml
---
title: Phase 3 is done
description: One sentence for the index and the meta description.
date: 2026-09-01
author: Orrin Team
draft: false           # true hides it from the index and skips the build
cover: ./phase-3.png   # optional
coverAlt: What the image shows.
---
```

### Updating the roadmap

[`src/data/roadmap.ts`](src/data/roadmap.ts) is a list of milestones on one
line. The title and date are always visible; `summary`, `details` and `points`
sit behind the expander, so the page stays short until someone asks for more.

```ts
{
  id: "demo",
  title: "Demo",
  when: "Q1 2027",
  summary: "One line, always visible.",
  details: ["A paragraph shown when the row is expanded."],
  points: ["An optional bullet."],
}
```

`tail` is the open end of the line — currently "Onward". The expanders are
native `<details>`, so they work with JavaScript disabled and find-in-page can
open one to reveal a match inside it.

### Refreshing the API reference

`src/content/docs/api-reference.md` is generated from the `///` comments in the
engine's `scripting/Orrin` sources. To rebuild it:

```bash
npm run api:docs
```

That needs the **.NET SDK** (matching the project's `net10.0` target) and
network access. It clones the engine shallowly, builds the scripting assembly
with `-p:GenerateDocumentationFile=true` — passed on the command line, so the
engine repo needs no change — parses the `Orrin.xml` the compiler emits, and
writes the page. Point it at a checkout you already have to skip the clone:

```bash
ORRIN_ENGINE_PATH=../orrin npm run api:docs
```

The output is committed, so the site build stays pure Node: you only need .NET
to *refresh* the reference, never to build the site. It also means an API
change shows up as a reviewable diff rather than appearing silently on a
deploy. **Never edit the generated file** — fix the doc comment in the C#
source and regenerate.

Both comment styles in the engine are handled: `/// <summary>…</summary>` and
bare `///` prose. Types under `Orrin.Tests.` and the Rust interop surface
(`Native`, `Bootstrap`, `GameAssembly`) are excluded — see `INTERNAL` in
[`scripts/gen-api-docs.mjs`](scripts/gen-api-docs.mjs).

## Layout

```
src/
  data/            ← all site copy lives here
    site.ts        Brand, nav, footer, external links
    home.ts        The landing page
    roadmap.ts     Phases and issue state
  content/
    docs/          Documentation (markdown, ordered by `order:`)
                     api-reference.md is GENERATED — see above
    blog/          Development notes (markdown, sorted by `date:`)
  lib/inline.ts    The *…* / [link] / `code` syntax used in data files
  pages/           Layout only — no copy
  components/      Nav, Footer, Backdrop, CodeBlock, Shot
  layouts/Base.astro
  styles/
    tokens.css     Every colour, font, space, radius and duration
    global.css     Everything else
scripts/
  gen-api-docs.mjs   Builds the C# API reference from the engine's sources
  announce-posts.mjs Posts new blog entries to Discord after a deploy
public/brand/      Banner and icon PNGs
public/shots/      Engine screenshots
```

## Design system

The palette is the engine's own. Every colour in
[`src/styles/tokens.css`](src/styles/tokens.css) is lifted from the `orrin-dark`
built-in theme in
[egui-orrin-theme](https://github.com/Orrin-Team/egui-orrin-theme) — nine greys
and an accent — so the site and the editor match:

```
text #D5D7DC · panel #141519 · window #1A1B20 · extreme #0F1013
faint #18191E · widget #1F2126 · widget_hover #2A2C33
outline #23252B · accent #4D8DFF
```

The status colours (`#5FB55A`, `#E8B34A`, `#FF7B72`) are fixed across every
editor theme, so green means the same thing on the roadmap as it does in the
tool.

Surfaces are translucent because the editor's are: its README describes Orrin's
popups as *frosted glass over a blurred scene*. The `.pane` class is that
material — a tint, a sheen from the top edge, and a 1px gradient border drawn as
a masked ring so it can catch light around the corner radius.

Two typefaces: **Geist** for display and body (hierarchy comes from weight and
size, not a third family), **JetBrains Mono** for machine text — which is the
same face the editor bundles.

`tokens.css` is the single source of truth. If you need a value that doesn't
exist, add it there first rather than hard-coding it in `global.css`.

### The animated backdrop

[`src/components/Backdrop.astro`](src/components/Backdrop.astro) draws a
wireframe mesh over a ground grid receding to a horizon — a viewport, in the
editor's accent — with three slow aurora blobs behind it for the glass to
refract. It's canvas 2D with the projection done by hand; about 500 edges a
frame, which is well below where a WebGL context would earn its weight.

It carries no content, pauses when the tab is hidden, and under
`prefers-reduced-motion` draws a single static frame instead of animating.

## Deploying

`npm run build` emits a fully static `dist/`. CI sets `SITE_URL`; local builds
fall back to the dev origin. The production CSP is `script-src 'self'`, so every
`<script>` must stay in an `.astro` component where Astro bundles it to a file —
no inline handlers.
