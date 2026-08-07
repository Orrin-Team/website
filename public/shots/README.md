# Screenshots

Engine captures live here. They're wired up from the `SHOTS` object at the top
of [`src/pages/index.astro`](../../src/pages/index.astro):

```js
const SHOTS = {
  editor: {
    src: "/shots/Editor.png",
    w: 2105,                     // the file's REAL pixel size
    h: 1228,
    caption: "The editor, mid-session",
    alt: "The Orrin editor: an entity hierarchy on the left, …",
  },
  // …
};
```

Anything in `public/` is served from the site root, so `public/shots/Editor.png`
is the URL `/shots/Editor.png`.

## Current slots

| Key | File | Size | Where it appears |
| --- | --- | --- | --- |
| `editor` | `Editor.png` | 2105 × 1228 | Showcase — full-width plate under "The editor" |
| `reload` | `BuildWatcher.png` | 607 × 266 | The "Two seconds, or it's a regression" diptych |

## Swapping or adding one

1. Drop the file in this folder.
2. Set `src`, and set `w`/`h` to the file's **real** pixel dimensions — they
   reserve the aspect ratio, so a mismatch makes the page jump as the image
   loads. Check with:

   ```bash
   sips -g pixelWidth -g pixelHeight public/shots/YourShot.png
   ```

3. Update `alt` to describe what the shot actually shows. Screen readers and
   search engines both read it.
4. For a new slot, add the entry and render it: `<Shot {...SHOTS.yourKey} />`.

If you remove a `src` (set it back to `undefined`), the slot falls back to a
labelled placeholder rather than breaking.

## Rules of thumb

- **Capture at 2× and export at 1×** on a HiDPI display, so the shot stays
  sharp without shipping a huge PNG.
- **Keep files under ~400 KB where you can.** `Editor.png` is currently 1.2 MB;
  re-exporting it as WebP would cut that by roughly 80 % with no visible loss.
  Change the extension in `src` to match if you do.
- **Dark UI reads better here** — the page is a dark canvas, so a light-mode
  capture will glare against it.
- **No need to add a frame.** The page renders shots without a border, and a
  real window capture already carries its own chrome.
- `Shot` takes `priority={true}` — set that only on an above-the-fold image,
  which skips lazy-loading and raises fetch priority for LCP. Everything below
  the fold should stay lazy.
