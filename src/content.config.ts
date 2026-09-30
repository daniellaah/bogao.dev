import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import contentRules from "@/data/content-rules.json";

const projectStatuses = contentRules.projectStatuses as [
  "active",
  "shipping",
  "archived",
  "lab",
];

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${contentRules.collections.blog.dir}`,
  }),
  schema: ({ image }) =>
    z
      .object({
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
      })
      // Unknown fields are typos; content-rules.json lists the same fields
      // for `npm run content:check`.
      .strict(),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${contentRules.collections.projects.dir}`,
  }),
  schema: ({ image }) =>
    z
      .object({
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
        demoUrl: z.string().url().optional(),
        repoUrl: z.string().url().optional(),
        ogImage: image().or(z.string()).optional(),
        canonicalURL: z.string().optional(),
      })
      .strict(),
});

export const collections = { blog, projects };
