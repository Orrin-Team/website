# Screenshots

Engine captures live here. They're wired up from the `shots` object at the top
of [`src/data/home.ts`](../../src/data/home.ts):

```ts
export const shots = {
  editor: {
    src: "/shots/Editor.webp",
    w: 2000,                     // the file's REAL pixel size
    h: 1192,
    alt: "The Orrin editor: an entity hierarchy on the left, …",
  },
  // …
};
```

Anything in `public/` is served from the site root, so `public/shots/Editor.webp`
is the URL `/shots/Editor.webp`.

## Current slots

| Key | File | Size | Where it appears |
| --- | --- | --- | --- |
| `editor` | `Editor.webp` | 2000 × 1192 | The wide plate under "The editor", and the "Clean design" card |
| `scripts` | `Scripts.png` | 618 × 386 | The "Test on the go" card |
| `sponza` | `Sponza.webp` | 2000 × 1192 | The "Fast and powerful 3D" card |

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
4. For a new slot, add the entry to `shots`, then point a `features` entry's
   `proof` at it (or `showcase.shot`) — also in `src/data/home.ts`.

If you remove a `src` (set it back to `undefined`), the slot falls back to a
labelled placeholder rather than breaking.

## Rules of thumb

- **Capture at 2× and export at 1×** on a HiDPI display, so the shot stays
  sharp without shipping a huge PNG.
- **Keep files under ~400 KB where you can.** WebP at 2000 px wide lands around
  240 KB for a full editor capture, which is the right ballpark. Change the
  extension in `src` to match the file you drop in.
- **Dark UI reads better here** — the page is a dark canvas, so a light-mode
  capture will glare against it.
- **Keep the window's own shadow and transparent corners.** Nothing on the page
  frames a screenshot, precisely so a window capture sits on the background as
  itself. A capture cropped flat to the window edge will look pasted on.
- **No need to add a frame.** The page renders shots without a border, and a
  real window capture already carries its own chrome.
- `Shot` takes `priority={true}` — set that only on an above-the-fold image,
  which skips lazy-loading and raises fetch priority for LCP. Everything below
  the fold should stay lazy.
