#!/usr/bin/env node
/**
 * Generates the C# API reference from the engine's own doc comments.
 *
 *   npm run api:docs
 *
 * What it does, in order:
 *
 *   1. Gets the engine's `scripting/` tree — a sparse, blobless clone of
 *      Orrin-Team/orrin, or a checkout you already have (ORRIN_ENGINE_PATH).
 *   2. Builds `scripting/Orrin` with `-p:GenerateDocumentationFile=true`.
 *      That flag is passed on the command line on purpose: it means the
 *      engine repo needs no change to support this, and the site can't be
 *      broken by someone editing Orrin.csproj.
 *   3. Parses the `Orrin.xml` the compiler emits and writes
 *      src/content/docs/api-reference.md.
 *
 * The output is committed. The site build stays pure Node — you only need the
 * .NET SDK to REFRESH the reference, never to build the site. That also means
 * an API change arrives as a reviewable diff rather than appearing silently on
 * a deploy.
 *
 * Two comment styles exist in the engine sources and both are handled:
 * `/// <summary>…</summary>` (Time.cs) and bare `///` prose (Entity.cs), which
 * the compiler emits as the member element's own text.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO = "https://github.com/Orrin-Team/orrin.git";
const OUT = "src/content/docs/api-reference.md";
/* --- The generated page's own front matter -------------------------------
 * These are the one part of the page that is yours rather than the engine's,
 * so they live here: edit them and they survive the next regenerate. Editing
 * the .md file directly does not — it gets overwritten.
 * ---------------------------------------------------------------------- */

const TITLE = "C# API reference";
const DESCRIPTION = "All C# API types and references go here.";
/** Where the generated page sits in the docs rail, via its `order:` field. */
const ORDER = 3;

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/* ---------------------------------------------------------------------------
 * 1 · Engine sources
 * ------------------------------------------------------------------------ */

function engineTree() {
  const local = process.env.ORRIN_ENGINE_PATH;
  if (local) {
    if (!existsSync(join(local, "scripting/Orrin/Orrin.csproj")))
      throw new Error(`ORRIN_ENGINE_PATH=${local} has no scripting/Orrin/Orrin.csproj`);
    console.log(`Using local engine checkout: ${local}`);
    return { dir: local, cleanup: () => {} };
  }

  const dir = mkdtempSync(join(tmpdir(), "orrin-api-"));
  console.log(`Cloning ${REPO} (sparse) …`);
  // blob:none + sparse: we need ~40 C# files, not the engine's whole history.
  run("git", ["clone", "--depth", "1", "--filter=blob:none", "--sparse", REPO, dir]);
  run("git", ["sparse-checkout", "set", "scripting"], dir);
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/* ---------------------------------------------------------------------------
 * 2 · Build, and read the XML the compiler emits
 * ------------------------------------------------------------------------ */

function buildDocs(dir) {
  console.log("Building scripting/Orrin …");
  run(
    "dotnet",
    [
      "build", "scripting/Orrin", "-c", "Release",
      "-p:GenerateDocumentationFile=true",
      // CS1591 is "public member without a doc comment" — a to-do for the
      // engine, not a reason to fail the site's doc generation.
      "-p:NoWarn=CS1591",
      "--nologo", "-v", "quiet",
    ],
    dir,
  );
  const xml = join(dir, "scripting/Orrin/bin/Release/net10.0/Orrin.xml");
  if (!existsSync(xml)) throw new Error(`build produced no ${xml}`);
  return readFileSync(xml, "utf8");
}

/* ---------------------------------------------------------------------------
 * 3 · Parse
 * -------------------------------------------------------------------------
 * A hand-rolled reader rather than an XML dependency: the file is machine-
 * written by Roslyn, so its shape is known, and the only awkward part is that
 * bare-prose members have text as their direct content instead of a <summary>.
 * ------------------------------------------------------------------------ */

const KEYWORDS = {
  "System.String": "string", "System.Boolean": "bool", "System.Single": "float",
  "System.Double": "double", "System.Int32": "int", "System.UInt32": "uint",
  "System.Int64": "long", "System.UInt64": "ulong", "System.Object": "object",
  "System.Void": "void", "System.Byte": "byte",
};

/** `System.Collections.Generic.List{Orrin.Entity}` → `List<Entity>` */
function shortType(t) {
  let s = KEYWORDS[t] ?? t;
  if (s === t) s = s.replace(/^Orrin\.(Math\.)?/, "").replace(/^System\.[\w.]*?(\w+)$/, "$1");
  return s
    .replace(/\{/g, "<")
    .replace(/\}/g, ">")
    .replace(/@$/, "")
    // Roslyn spells generic arity as a backtick count: AssetRef`1 → AssetRef<T>.
    .replace(/`(\d+)/g, (_m, n) =>
      `<${Number(n) === 1 ? "T" : Array.from({ length: +n }, (_, i) => `T${i + 1}`).join(", ")}>`,
    );
}

/** Split a parameter list on top-level commas only — generics nest with {}. */
function splitParams(s) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "{" || ch === "(") depth++;
    else if (ch === "}" || ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Turn the inline doc tags into markdown. */
function inlineTags(s) {
  return s
    .replace(/<see\s+cref="[A-Z]:([^"]+)"\s*\/>/g, (_m, r) => `\`${shortType(r.split("(")[0])}\``)
    .replace(/<see\s+langword="([^"]+)"\s*\/>/g, "`$1`")
    .replace(/<(?:paramref|typeparamref)\s+name="([^"]+)"\s*\/>/g, "`$1`")
    .replace(/<\/?c>/g, "`")
    .replace(/<\/?para>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/** Collapse a doc fragment to clean prose, preserving blank-line paragraphs. */
function prose(s) {
  return inlineTags(s)
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parse(xml) {
  const members = [];
  const re = /<member name="([^"]+)">([\s\S]*?)<\/member>/g;
  let m;
  while ((m = re.exec(xml))) {
    const [, name, bodyRaw] = m;
    const summaryMatch = bodyRaw.match(/<summary>([\s\S]*?)<\/summary>/);
    // Bare prose: everything that isn't a known block tag is the summary.
    const body = summaryMatch
      ? summaryMatch[1]
      : bodyRaw.replace(/<(param|typeparam|returns|remarks|exception|example)[\s\S]*?<\/\1>/g, "");

    const params = [...bodyRaw.matchAll(/<param name="([^"]+)">([\s\S]*?)<\/param>/g)]
      .map(([, n, d]) => ({ name: n, doc: prose(d) }));
    const returns = bodyRaw.match(/<returns>([\s\S]*?)<\/returns>/);
    const remarks = bodyRaw.match(/<remarks>([\s\S]*?)<\/remarks>/);

    members.push({
      kind: name[0],
      id: name.slice(2),
      summary: prose(body),
      params,
      returns: returns ? prose(returns[1]) : null,
      remarks: remarks ? prose(remarks[1]) : null,
    });
  }
  return members;
}

/* ---------------------------------------------------------------------------
 * 4 · Shape into types with members
 * ------------------------------------------------------------------------ */

function organise(members) {
  const types = new Map();
  const typeOf = (id) => {
    const bare = id.split("(")[0];
    return bare.slice(0, bare.lastIndexOf("."));
  };

  for (const m of members.filter((x) => x.kind === "T")) {
    types.set(m.id, { id: m.id, name: shortType(m.id), doc: m, members: [] });
  }
  for (const m of members.filter((x) => x.kind !== "T")) {
    const id = typeOf(m.id);
    // A type with no doc comment of its own still has documented members —
    // Input, World and Native between them account for 28 of them. Give it an
    // entry rather than dropping its members on the floor.
    if (!types.has(id)) {
      types.set(id, {
        id,
        name: shortType(id),
        doc: { summary: "", remarks: null },
        members: [],
        undocumented: true,
      });
    }
    types.get(id).members.push(m);
  }

  // Fields, then properties, then methods; alphabetical inside each. That's
  // the order someone reads a type in: what it holds, then what it exposes,
  // then what it does.
  const rank = { F: 0, P: 1, M: 2, E: 3 };
  for (const t of types.values()) {
    t.members.sort(
      (a, b) => rank[a.kind] - rank[b.kind] || signature(a).localeCompare(signature(b)),
    );
  }
  return [...types.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** `M:Orrin.World.Spawn(System.String)` → `Spawn(string)` */
function signature(m) {
  const [path, args] = m.id.split("(");
  let name = path.slice(path.lastIndexOf(".") + 1);
  const generic = name.match(/^(.*)``(\d+)$/);
  if (generic) name = `${generic[1]}<${generic[2] === "1" ? "T" : "T1, T2"}>`;
  if (m.kind !== "M") return name;
  const list = args ? splitParams(args.replace(/\)$/, "")).map(shortType).join(", ") : "";
  return `${name}(${list})`;
}

/* ---------------------------------------------------------------------------
 * 5 · Emit
 * ------------------------------------------------------------------------ */

function markdown(types, commit) {
  const kindLabel = { F: "field", P: "property", M: "method", E: "event" };
  const out = [];

  out.push("---");
  out.push(`title: ${TITLE}`);
  out.push(`description: ${DESCRIPTION}`);
  out.push(`order: ${ORDER}`);
  out.push("---");
  out.push("");
  out.push(
    "<!-- GENERATED FILE — DO NOT EDIT.",
    "     Produced by scripts/gen-api-docs.mjs from the doc comments in",
    "     Orrin-Team/orrin:scripting/Orrin. To change anything on this page,",
    "     change the `///` comment in the engine source and run `npm run api:docs`.",
    "-->",
    "",
  );
  out.push(
    `Generated from the \`Orrin\` scripting assembly at commit \`${commit}\`. Every`,
    "entry below is the engine's own doc comment — if something here is wrong or",
    "missing, the fix belongs in the C# source, not on this page.",
    "",
  );

  out.push("## Types", "");
  for (const t of types) {
    const first = (t.doc.summary.split("\n\n")[0] || "").replace(/\s+/g, " ");
    const link = `- [\`${t.name}\`](#${anchor(t.name)})`;
    out.push(first ? `${link} — ${first}` : link);
  }
  out.push("");

  for (const t of types) {
    // Escaped: a bare `## AssetRef<T>` makes markdown parse <T> as an HTML
    // tag, which both mangles the heading and changes the id the anchors in
    // the index above are pointing at.
    out.push("---", "", `## ${t.name.replace(/</g, "\\<").replace(/>/g, "\\>")}`, "");
    if (t.doc.summary) out.push(t.doc.summary, "");
    if (t.doc.remarks) out.push(t.doc.remarks, "");

    if (!t.members.length) {
      out.push("_No documented members._", "");
      continue;
    }

    for (const m of t.members) {
      out.push(`### \`${signature(m)}\``, "");
      out.push(`<span class="api-kind">${kindLabel[m.kind] ?? m.kind}</span>`, "");
      if (m.summary) out.push(m.summary, "");
      if (m.params.length) {
        out.push("| Parameter | |", "| --- | --- |");
        for (const p of m.params)
          out.push(`| \`${p.name}\` | ${p.doc.replace(/\n/g, " ").replace(/\|/g, "\\|")} |`);
        out.push("");
      }
      if (m.returns) out.push(`**Returns** — ${m.returns}`, "");
      if (m.remarks) out.push(m.remarks, "");
    }
  }
  return out.join("\n") + "\n";
}

/**
 * Must match github-slugger, which is what remark uses to id a heading:
 * lowercase, strip everything that isn't a word character, space or hyphen,
 * then spaces to hyphens. `AssetRef<T>` → `assetreft`.
 */
const anchor = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* ---------------------------------------------------------------------------
 * main
 * ------------------------------------------------------------------------ */

/**
 * Not part of the scripting API someone writing a game would use: the Rust
 * interop surface, and the engine's own lifecycle test probes.
 */
const INTERNAL = new Set(["Orrin.Native", "Orrin.Bootstrap", "Orrin.GameAssembly"]);
const INTERNAL_PREFIX = ["Orrin.Tests."];

const isInternal = (id) =>
  INTERNAL.has(id) || INTERNAL_PREFIX.some((p) => id.startsWith(p));

const { dir, cleanup } = engineTree();
try {
  const commit = run("git", ["rev-parse", "--short", "HEAD"], dir).trim();
  const types = organise(parse(buildDocs(dir))).filter((t) => !isInternal(t.id));
  const documented = types.reduce((n, t) => n + t.members.length, 0);
  if (!types.length) throw new Error("no public types found — did the XML shape change?");
  writeFileSync(OUT, markdown(types, commit));
  console.log(`Wrote ${OUT} — ${types.length} types, ${documented} members (engine ${commit}).`);
} finally {
  cleanup();
}
