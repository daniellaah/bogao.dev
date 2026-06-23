import type { CollectionEntry } from "astro:content";
import { isPublishedProject } from "./projectVisibility";

const statusRank = {
  shipping: 0,
  active: 1,
  lab: 2,
  archived: 3,
} as const;

export default function getSortedProjects(
  projects: CollectionEntry<"projects">[]
) {
  return projects.filter(isPublishedProject).sort((a, b) => {
    const aUsesAutoDate = a.data.order === -1;
    const bUsesAutoDate = b.data.order === -1;

    if (a.data.featured !== b.data.featured) {
      return Number(b.data.featured) - Number(a.data.featured);
    }

    if (aUsesAutoDate !== bUsesAutoDate) {
      return Number(aUsesAutoDate) - Number(bUsesAutoDate);
    }

    if (aUsesAutoDate && bUsesAutoDate) {
      const aStartDate = a.data.startDate?.getTime() ?? 0;
      const bStartDate = b.data.startDate?.getTime() ?? 0;

      if (aStartDate !== bStartDate) {
        return bStartDate - aStartDate;
      }
    }

    if (a.data.order !== b.data.order) {
      return a.data.order - b.data.order;
    }

    if (a.data.year !== b.data.year) {
      return (b.data.year ?? 0) - (a.data.year ?? 0);
    }

    return statusRank[a.data.status] - statusRank[b.data.status];
  });
}
