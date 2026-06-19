import type { CollectionEntry } from "astro:content";

export default function getLatestProjects(
  projects: CollectionEntry<"projects">[],
  limit = 4
) {
  return projects
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        (b.data.startDate?.getTime() ?? 0) - (a.data.startDate?.getTime() ?? 0)
    )
    .slice(0, limit);
}
