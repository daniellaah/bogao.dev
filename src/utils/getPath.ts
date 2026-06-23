import { getPathSegmentSlug, getResolvedSlug } from "./contentSlug";

const BLOG_PATH = "src/content/blog";

/**
 * Build a blog post URL path from Astro content metadata.
 * @param id - Astro content id for the blog post
 * @param filePath - optional source file path used to preserve nested folders
 * @param includeBase - whether to include `/posts` in return value
 * @param explicitSlug - frontmatter slug that overrides the id-derived slug
 * @returns blog post URL path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
  explicitSlug?: string
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => getPathSegmentSlug(segment)); // slugify each segment path

  const basePath = includeBase ? "/posts" : "";
  const slug = getResolvedSlug(id, explicitSlug);

  // If not inside a nested content directory, return only the post slug.
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, slug].join("/");
  }

  return [basePath, ...pathSegments, slug].join("/");
}
