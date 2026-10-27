#!/usr/bin/env node
// Announce newly published blog posts to Discord.
//
// Run after a successful deploy, with the range of commits that just shipped:
//
//   DISCORD_WEBHOOK_URL=... node scripts/announce-posts.mjs <before-sha> <after-sha>
//
// The webhook URL is a credential and never lives in this repo — CI passes it
// in from a GitHub Actions secret. Add --dry-run to print what would be sent.
//
// A post is announced when it goes live and not before: it has to be added (or
// flipped out of draft) in this range AND have actually built into dist/. The
// dist/ check is what keeps drafts quiet — Astro doesn't emit a page for them,
// so there's nothing to link to and nothing gets sent.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const BLOG_DIR = "src/content/blog";
const DIST_DIR = "dist";
/** Discord rejects a message over 2000 characters outright. */
const MAX_CONTENT = 2000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [before, after] = args.filter((a) => !a.startsWith("--"));

const webhook = process.env.DISCORD_WEBHOOK_URL;
const siteUrl = process.env.SITE_URL;

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function git(...argv) {
  return execFileSync("git", argv, { encoding: "utf8" });
}

/**
 * Minimal frontmatter reader for single-line scalars, which is all the blog
 * schema uses. Deliberately does NOT try to be a YAML parser: a block scalar
 * (`title: >`) leaves the value empty, and the caller skips the post with a
 * warning rather than announcing something malformed.
 */
function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return null;

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    // Blank, comment, or an indented key belonging to a nested block.
    if (!line.trim() || line.trimStart().startsWith("#") || /^\s/.test(line)) {
      continue;
    }
    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    // Everything after the FIRST colon, so a value containing one survives.
    let value = line.slice(colon + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    data[key] = value;
  }
  return data;
}

/** Frontmatter of `path` as it existed at `ref`, or null if it wasn't there. */
function frontmatterAt(ref, path) {
  try {
    return parseFrontmatter(git("show", `${ref}:${path}`));
  } catch {
    return null; // Didn't exist at that ref.
  }
}

function isDraft(frontmatter) {
  return String(frontmatter?.draft ?? "false").toLowerCase() === "true";
}

async function post(url, content) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content,
      // A title containing @everyone must not be able to ping a whole server.
      allowed_mentions: { parse: [] },
    }),
  });

  if (res.status === 429) {
    const retryAfter = Number((await res.json().catch(() => ({}))).retry_after);
    const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 2000;
    console.log(`rate limited, retrying in ${Math.round(waitMs)}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
    return post(url, content);
  }

  if (!res.ok) {
    // Never echo the response body or URL — the URL is the credential.
    throw new Error(`Discord returned ${res.status} ${res.statusText}`);
  }
}

// ---------------------------------------------------------------------------

if (!before || !after) {
  fail("usage: announce-posts.mjs <before-sha> <after-sha> [--dry-run]");
}
if (!siteUrl) fail("SITE_URL is not set — the announcement needs a real link.");
if (!webhook && !dryRun) {
  console.log("DISCORD_WEBHOOK_URL is not set; skipping announcements.");
  process.exit(0);
}

// A zero SHA is GitHub's way of saying "no previous commit" — a new branch or
// the first push. There's no meaningful range to diff, so announce nothing
// rather than every post that has ever existed.
if (/^0+$/.test(before)) {
  console.log("No previous commit in this push; skipping announcements.");
  process.exit(0);
}

let changed;
try {
  changed = git("diff", "--name-status", before, after, "--", BLOG_DIR);
} catch {
  fail(`could not diff ${before}..${after} — is the history deep enough?`);
}

const candidates = [];
for (const line of changed.split("\n")) {
  if (!line.trim()) continue;
  const [status, ...paths] = line.split("\t");
  const path = paths[paths.length - 1];
  if (!path?.endsWith(".md")) continue;
  // A = added, M = modified, R = renamed. Deletions can't be announced.
  if (!["A", "M", "R"].includes(status[0])) continue;
  candidates.push({ status: status[0], path });
}

const announcements = [];
for (const { status, path } of candidates) {
  const slug = path.slice(BLOG_DIR.length + 1).replace(/\.md$/, "");
  const current = frontmatterAt(after, path);

  if (!current) {
    console.warn(`skip ${slug}: no frontmatter found`);
    continue;
  }

  // The build is the source of truth for "is this live". Drafts never produce
  // a page, so this covers them without trusting the frontmatter twice.
  if (!existsSync(resolve(DIST_DIR, "blog", slug, "index.html"))) {
    console.log(`skip ${slug}: not present in the build (draft, or unbuilt)`);
    continue;
  }

  // Was it already public before this push? Then it's an edit, not a release.
  const previous = status === "A" ? null : frontmatterAt(before, path);
  if (previous && !isDraft(previous)) {
    console.log(`skip ${slug}: already published before this deploy`);
    continue;
  }

  const title = current.title?.trim();
  const description = current.description?.trim();
  if (!title) {
    console.warn(`skip ${slug}: no single-line title in frontmatter`);
    continue;
  }

  const url = `${siteUrl.replace(/\/+$/, "")}/blog/${slug}/`;
  const head = `**${title}**\n`;
  const tail = `\n${url}`;
  const room = MAX_CONTENT - head.length - tail.length;
  let body = description ?? "";
  if (body.length > room) body = `${body.slice(0, Math.max(0, room - 1))}…`;

  announcements.push({ slug, content: `${head}${body}${tail}` });
}

if (announcements.length === 0) {
  console.log("No newly published posts in this range.");
  process.exit(0);
}

for (const { slug, content } of announcements) {
  if (dryRun) {
    console.log(`--- would announce ${slug} ---\n${content}\n`);
    continue;
  }
  await post(webhook, content);
  console.log(`announced ${slug}`);
}
