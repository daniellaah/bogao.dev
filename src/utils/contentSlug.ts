import {
  getPathSegmentSlug as getPathSegmentSlugCore,
  getResolvedSlug as getResolvedSlugCore,
} from "./slugifyCore";

export const getPathSegmentSlug = (segment: string) =>
  getPathSegmentSlugCore(segment);

export const getResolvedSlug = (id: string, explicitSlug?: string) =>
  getResolvedSlugCore(id, explicitSlug);
