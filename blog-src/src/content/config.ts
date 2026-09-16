import { defineCollection, z } from "astro:content";

// Frontmatter contract for every post. Kept intentionally small so writing
// a post is low-friction; extend here when a new field is genuinely needed.
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    level: z.enum(["Foundations", "Intermediate", "Advanced"]).default("Foundations"),
    // Optional override; if omitted the reading time is computed at render time.
    readingTime: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
