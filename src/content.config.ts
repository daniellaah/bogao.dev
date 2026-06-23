import { defineCollection, z } from "astro:content";
import { SITE } from "@/config";
import contentRules from "@/data/content-rules.json";
import { BLOG_PATH } from "@/utils/contentPaths";

export { BLOG_PATH };

const projectStatuses = contentRules.projectStatuses as [
  "active",
  "shipping",
  "archived",
  "lab",
];

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
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
    }),
});

const projects = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
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
    }),
});

const notes = defineCollection({
  schema: () =>
    z.object({
      title: z.string().trim().min(1).optional(),
      slug: z.string().trim().min(1).optional(),
      description: z.string().trim().min(1),
      noteDate: z.coerce.date(),
      modDatetime: z.coerce.date().optional().nullable(),
      draft: z.boolean().default(false),
      location: z.string().trim().min(1).optional(),
      tags: z.array(z.string()).default([]),
      photos: z.array(z.string()).default([]),
      canonicalURL: z.string().optional(),
    }),
});

export const collections = { blog, projects, notes };
