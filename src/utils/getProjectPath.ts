import { getResolvedSlug } from "./contentSlug";

export function getProjectPath(id: string) {
  return `/projects/${getResolvedSlug(id)}`;
}
