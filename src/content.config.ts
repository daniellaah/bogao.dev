import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import contentRules from "@/data/content-rules.json";

const projectStatuses = contentRules.projectStatuses as [
  "active",
  "shipping",
  "archived",
  "lab",
];

// Schemas are strict: an unknown field is a typo. content-rules.json lists
// the same fields for `npm run content:check`.
const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${contentRules.collections.blog.dir}`,
  }),
  schema: ({ image }) =>
    z.strictObject({
      author: z.string().default(SITE.author),
      pubDatetime: z.coerce.date().optional().nullable(),
      modDatetime: z.coerce.date().optional().nullable(),
      title: z.string(),
      slug: z.string().trim().min(1).optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default([]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      // BCP 47 tag, e.g. "zh-CN". Detected from the title when omitted.
      lang: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${contentRules.collections.projects.dir}`,
  }),
  schema: ({ image }) =>
    z.strictObject({
      title: z.string(),
      description: z.string(),
      // Small label above the card title, e.g. "Featured project".
      kicker: z.string().optional(),
      // Highlights shown on project cards; `stack` lists the full tech stack.
      tags: z.array(z.string()).default([]),
      status: z.enum(projectStatuses).default("active"),
      order: z.number().int().default(99),
      startDate: z.coerce.date().optional().nullable(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      year: z.number().int().optional(),
      stack: z.array(z.string()).default([]),
      demoUrl: z.url().optional(),
      repoUrl: z.url().optional(),
      // Case study: your part in the project, up to four headline results
      // shown under the title, and an optional diagram or screenshot.
      role: z.string().optional(),
      metrics: z
        .array(z.strictObject({ value: z.string(), label: z.string() }))
        .max(4)
        .default([]),
      cover: z
        .strictObject({
          src: image(),
          alt: z.string().min(1),
          caption: z.string().optional(),
        })
        .optional(),
      ogImage: image().or(z.string()).optional(),
      canonicalURL: z.string().optional(),
    }),
});

export const collections = { blog, projects };
