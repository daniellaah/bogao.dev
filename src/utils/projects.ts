import { getCollection, type CollectionEntry } from "astro:content";
import { getResolvedSlug } from "./slugifyCore";

export const ACCENTS = ["yellow", "blue", "pink", "green"] as const;
export type Accent = (typeof ACCENTS)[number];

/** A published project with the marker color it uses on cards and its page. */
export type Project = CollectionEntry<"projects"> & { accent: Accent };

const STATUS_RANK = { shipping: 0, active: 1, lab: 2, archived: 3 } as const;

const usesStartDate = ({ data }: CollectionEntry<"projects">) =>
  data.order === -1;

// Featured first, then manual `order`, then `order: -1` projects by newest
// startDate; ties by year (newest) and status.
const byDisplayOrder = (
  a: CollectionEntry<"projects">,
  b: CollectionEntry<"projects">
) =>
  Number(b.data.featured) - Number(a.data.featured) ||
  Number(usesStartDate(a)) - Number(usesStartDate(b)) ||
  (usesStartDate(a) && usesStartDate(b)
    ? (b.data.startDate?.getTime() ?? 0) - (a.data.startDate?.getTime() ?? 0)
    : 0) ||
  a.data.order - b.data.order ||
  (b.data.year ?? 0) - (a.data.year ?? 0) ||
  STATUS_RANK[a.data.status] - STATUS_RANK[b.data.status];

/** Published projects in display order; accents cycle by position. */
export const sortProjects = (projects: CollectionEntry<"projects">[]) =>
  projects
    .filter(({ data }) => !data.draft)
    .sort(byDisplayOrder)
    .map(
      (project, index): Project => ({
        ...project,
        accent: ACCENTS[index % ACCENTS.length],
      })
    );

export const getProjects = async () =>
  sortProjects(await getCollection("projects"));

/** A project's URL segment, from its file name. */
export const getProjectSlug = (id: string): string => getResolvedSlug(id);

export const getProjectPath = (id: string) =>
  `/projects/${getProjectSlug(id)}/`;
