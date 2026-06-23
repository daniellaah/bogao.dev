import type { CollectionEntry } from "astro:content";

export const isPublishedProject = (project: CollectionEntry<"projects">) =>
  !project.data.draft;

export const getPublishedProjects = (projects: CollectionEntry<"projects">[]) =>
  projects.filter(isPublishedProject);
