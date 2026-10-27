/* =============================================================================
 * roadmap.ts — the milestone timeline
 * =============================================================================
 * src/pages/roadmap.astro renders this file. To change the roadmap, edit here.
 *
 * Each milestone is a row on the line. The title and date are always visible;
 * everything in `details` and `points` is behind the expander, so the page
 * stays a short list until someone asks for more.
 *
 *   summary   one line, always visible under the title. Optional.
 *   details   paragraphs shown when the row is expanded. One string each.
 *   points    an optional bullet list under those paragraphs.
 *
 * `details` and `points` take the same inline formatting as the rest of
 * src/data/: *accent*, [label](/href/) and `code`.
 *
 * The last entry in `tail` is the open-ended end of the line — no date, no
 * expander, just where the track runs out.
 * ========================================================================== */

export type Milestone = {
  id: string;
  title: string;
  when: string;
  summary?: string;
  details?: string[];
  points?: string[];
};

/* -----------------------------------------------------------------------------
 * The milestones
 * -----------------------------------------------------------------------------
 * NOTE: the `details` and `points` below are starting text, not a commitment.
 * Replace them with the real plan — that's what the expanders are for.
 * -------------------------------------------------------------------------- */

export const milestones: Milestone[] = [
  {
    id: "demo",
    title: "Demo",
    when: "Q1 2027",
    summary: "A usable release of the engine that you can make basic games with.",
    details: [
      "The point of the demo is both for me and the community. For me this will be the point where I can use the engine personally for real projects; for the community it showcases the engine, so people can get a feel for it, give feedback and report bugs. Finally, beyond this point Orrin would have its collaboration on GitHub fully set up.",
    ],
    points: [
      "Exportable games.",
      "Audio, UI and other essentials.",
      "First ever game on this engine.",
    ],
  },
  {
    id: "pre-release",
    title: "Pre-release",
    when: "Q1 2028",
    summary: "A release through a proper installer, where it's expected you can make full-fledged games.",
    details: [
      "Pre-release is the point where I believe you can make a fully featured game, but still lacking full stability, more demanding features, and more. This is also where I believe people will start using this project.",
    ],
    points: [
      "Installer for this engine.",
      "Physics, multiplayer and more.",
      "Collaboration capabilities.",
    ],
  },
  {
    id: "1-0",
    title: "1.0 Release",
    when: "Q4 2028",
    summary: "A fully stable cross-platform release where real projects are made.",
    details: [
      "1.0 proves that the engine is stable enough for use outside of the indie sphere. More features like ray tracing, 2D and an asset store would be in place. Orrin would be able to compete with the big 3 engines at this point.",
    ],
  },
];

/** The open end of the line. No date, no expander. */
export const tail = "Onward";

/* -----------------------------------------------------------------------------
 * Page copy
 * -------------------------------------------------------------------------- */

/**
 * The closing panel. `action` is optional: leave it out and the section is a
 * heading and a paragraph with no button. When present it links to the
 * Discord, so it needs a label and nothing else.
 *
 * It's typed rather than inferred so that deleting `action` stays valid — with
 * a bare object literal, TypeScript decides the property doesn't exist at all
 * and the template that renders it stops compiling.
 */
type RoadmapPage = {
  title: string;
  lede: string;
  closer: {
    heading: string;
    body: string;
    action?: { label: string };
  };
};

export const roadmapPage: RoadmapPage = {
  title: "Roadmap",
  lede: "A showcase of goals and features that I want to achieve with Orrin in the coming years.",
  closer: {
    heading: "Goals after 1.0",
    body: "After 1.0 I hope to bring this engine to the console and VR sphere of things. I'd like to be close with the developers of these platforms and figure out what's best to go forward with; as of right now it's unclear where Orrin should be headed.",
  },
};
