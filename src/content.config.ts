import { defineCollection, z } from "astro:content";
import { SITE } from "@/config";

export const BLOG_PATH = "src/content/blog";
export const PROJECTS_PATH = "src/content/projects";
export const NOTES_PATH = "src/content/notes";

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      lang: z.enum(SITE.supportedLangs),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      timezone: z.string().optional(),
    }),
});

const projects = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      status: z
        .enum(["active", "shipping", "archived", "lab"])
        .default("active"),
      order: z.number().int().default(99),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      lang: z.enum(SITE.supportedLangs).default(SITE.lang),
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
      description: z.string().trim().min(1),
      noteDate: z.coerce.date(),
      modDatetime: z.coerce.date().optional().nullable(),
      draft: z.boolean().default(false),
      lang: z.enum(SITE.supportedLangs).default(SITE.lang),
      location: z.string().trim().min(1).optional(),
      tags: z.array(z.string()).default([]),
      photos: z.array(z.string()).default([]),
      canonicalURL: z.string().optional(),
    }),
});

export const collections = { blog, projects, notes };
