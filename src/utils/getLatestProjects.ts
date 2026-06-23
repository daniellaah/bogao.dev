import type { CollectionEntry } from "astro:content";
import { getPublishedProjects } from "./projectVisibility";

export default function getLatestProjects(
  projects: CollectionEntry<"projects">[],
  limit = 4
) {
  return getPublishedProjects(projects)
    .sort(
      (a, b) =>
        (b.data.startDate?.getTime() ?? 0) - (a.data.startDate?.getTime() ?? 0)
    )
    .slice(0, limit);
}
