import type { CollectionEntry } from "astro:content";
import { getPathSegmentSlug, getResolvedSlug } from "./slugifyCore";

const BLOG_DIR = "src/content/blog/";

/**
 * URL of a blog post: `/posts/<folders>/<slug>/`. Folders are the post's
 * parent directories (except ones starting with "_"); the slug is the
 * frontmatter `slug`, else the file name. With `includeBase` false, returns
 * the `[...slug]` route param `<folders>/<slug>`.
 */
export const getPostPath = (
  post: CollectionEntry<"blog">,
  includeBase = true
) => {
  const folders = (post.filePath ?? "")
    .replace(BLOG_DIR, "")
    .split("/")
    .slice(0, -1)
    .filter(folder => folder && !folder.startsWith("_"))
    .map(folder => getPathSegmentSlug(folder));
  const param = [...folders, getResolvedSlug(post.id, post.data.slug)].join(
    "/"
  );

  return includeBase ? `/posts/${param}/` : param;
};
