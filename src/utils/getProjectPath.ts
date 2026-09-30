import { getResolvedSlug } from "./slugifyCore";

/** A project's URL segment, from its file name. */
export const getProjectSlug = (id: string): string => getResolvedSlug(id);

export const getProjectPath = (id: string) =>
  `/projects/${getProjectSlug(id)}/`;
