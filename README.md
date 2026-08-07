# Orrin Engine — website

Static site for [Orrin](https://github.com/Orrin-Team/orrin), built with Astro.
No runtime, no client framework — the only JavaScript shipped is the nav
scroll-frost, the mobile menu, and the copy-to-clipboard buttons.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview
```

## Layout

```
src/
  content/
    docs/          Documentation pages (markdown, ordered by `order:`)
    blog/          Development notes (markdown, sorted by `date:`)
  pages/
    index.astro    Landing page
    roadmap.astro  Phase timeline — data lives in the frontmatter
    docs/          Docs index + [...slug]
    blog/          Blog index + [...slug]
  components/      Nav, Footer, CodeBlock, Shot
  layouts/Base.astro
  styles/
    tokens.css     Every colour, font, space, easing and duration token
    global.css     Everything else
public/brand/      Banner and icon PNGs
public/shots/      Engine screenshots — see the README in that folder
```

## Filling in the screenshots

The landing page has three screenshot slots, currently rendering labelled
placeholders. To fill one in, drop the capture into `public/shots/` and set
`src` in the `SHOTS` object at the top of
[`src/pages/index.astro`](src/pages/index.astro). That's the only edit — the
placeholder disappears and the layout doesn't shift, because the aspect ratio
is already reserved. Details and target sizes are in
[`public/shots/README.md`](public/shots/README.md).

## Adding a doc page

Drop a `.md` file in `src/content/docs/`:

```yaml
---
title: Rendering
description: One sentence, used in the page head and the docs index.
order: 5
---
```

The sidebar and prev/next links pick it up from `order:` automatically.

## Adding a blog post

Drop a `.md` file in `src/content/blog/`:

```yaml
---
title: Phase 3 is done
description: One sentence for the index and the meta description.
date: 2026-09-01
author: Orrin Team
draft: false      # true hides it from the index and skips the build
---
```

## Updating the roadmap

The phase data is a typed array at the top of
[`src/pages/roadmap.astro`](src/pages/roadmap.astro). Each phase carries either
`items` (real GitHub issues with `done:` state, which drives the node style and
the "N of M closed" count) or `notes` (unscheduled work from the architecture
plan). Bump `SNAPSHOT` when you refresh the issue state.

To pull current state from the tracker:

```bash
gh issue list -R Orrin-Team/orrin --state all --limit 100 \
  --json number,title,state,milestone
```

## Design system

`src/styles/tokens.css` is the single source of truth. Colours are OKLCH,
anchored on the two hues sampled from `OrrinBanner.png` — teal `#02181b`
(hue ~207) and navy `#08111e` (hue ~257). Paper takes the navy end; the ice-cyan
accent takes the teal end.

Three typefaces, one job each: **Bricolage Grotesque** (display),
**Geist** (body), **JetBrains Mono** (machine text — commands, identifiers,
issue numbers, dates). Nothing else.

Every colour and font in `global.css` references a token by name. If you need a
value that doesn't exist, add it to `tokens.css` first.

## Deploying

`npm run build` emits a fully static `dist/`. Set `site` in
[`astro.config.mjs`](astro.config.mjs) to the real domain before deploying —
it's currently pointed at GitHub Pages and is used for canonical URLs and the
Open Graph image.
