import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  // `image()` resolves the path relative to the markdown file and hands back an
  // optimised asset, so a cover has to live in src/ alongside the post — not in
  // public/, which ships the original bytes untouched.
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        author: z.string().default("Orrin Team"),
        draft: z.boolean().default(false),
        /** Hero on the post, thumbnail on the index. Both, or neither. */
        cover: image().optional(),
        /** Describes the cover. Required whenever `cover` is set. */
        coverAlt: z.string().optional(),
      })
      // A cover with no alt text is a build error rather than a silent a11y
      // hole — the index and the post both render it, so it'd be wrong twice.
      .refine((data) => !data.cover || !!data.coverAlt, {
        message: "coverAlt is required when cover is set",
        path: ["coverAlt"],
      }),
});

export const collections = { docs, blog };
