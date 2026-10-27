/* =============================================================================
 * inline.ts — the small amount of formatting allowed inside src/data/ strings
 * =============================================================================
 * Content in src/data/ is plain text, which means it can't carry a link or a
 * highlighted phrase. Rather than putting HTML in the data files — where one
 * unclosed tag breaks the page and nothing warns you — three markdown-shaped
 * forms are supported and nothing else:
 *
 *   *highlighted*        the accent-tinted run used in headlines
 *   [label](/href/)      a link
 *   `code`               inline monospace
 *
 * Everything is escaped first, so a stray < or & in your copy is safe and
 * anything that isn't one of the three forms above comes out as literal text.
 * ========================================================================== */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Render the inline syntax to an HTML string, for use with `set:html`.
 *
 * Order matters: code spans are replaced first and their contents are left
 * alone, so a `*` or `[` inside backticks stays literal.
 */
export function inline(text: string): string {
  const code: string[] = [];

  // Pull code spans out and leave a placeholder, so later passes can't see in.
  // \u0000 can't appear in the source strings, which makes it a safe sentinel.
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_m, body: string) => {
    code.push(body);
    return `\u0000${code.length - 1}\u0000`;
  });

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label: string, href: string) => {
      const external = /^https?:/i.test(href);
      const rel = external ? ' rel="noopener"' : "";
      return `<a href="${href}"${rel}>${label}</a>`;
    },
  );

  // Non-greedy, and the run may not start or end on whitespace — so "2 * 3 * 4"
  // is left alone while "*this*" is not.
  out = out.replace(
    /\*(\S(?:[^*]*\S)?)\*/g,
    (_m, body: string) => `<span class="hl">${body}</span>`,
  );

  return out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${code[Number(i)]}</code>`);
}
