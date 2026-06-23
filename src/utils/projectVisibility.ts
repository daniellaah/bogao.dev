import type { CollectionEntry } from "astro:content";

export const isPublishedProject = (project: CollectionEntry<"projects">) =>
  !project.data.draft;
