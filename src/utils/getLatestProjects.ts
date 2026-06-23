import type { CollectionEntry } from "astro:content";
import { isPublishedProject } from "./projectVisibility";

export default function getLatestProjects(
  projects: CollectionEntry<"projects">[],
  limit = 4
) {
  return projects
    .filter(isPublishedProject)
    .sort(
      (a, b) =>
        (b.data.startDate?.getTime() ?? 0) - (a.data.startDate?.getTime() ?? 0)
    )
    .slice(0, limit);
}
