import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { getPathSegmentSlug, getResolvedSlug } from "./slugifyCore";

/** A published post: not a draft, and dated. */
export type Post = CollectionEntry<"blog"> & {
  data: CollectionEntry<"blog">["data"] & { pubDatetime: Date };
};

const isPublished = (post: CollectionEntry<"blog">): post is Post => {
  const { draft, pubDatetime } = post.data;
  if (draft || !pubDatetime) return false;
  // Scheduled posts show in development; builds include them once due.
  return (
    import.meta.env.DEV ||
    Date.now() > pubDatetime.getTime() - SITE.scheduledPostMargin
  );
};

/** Published posts, newest first. */
export const sortPosts = (posts: CollectionEntry<"blog">[]) =>
  posts
    .filter(isPublished)
    .sort(
      (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
    );

export const getPosts = async () => sortPosts(await getCollection("blog"));

const BLOG_DIR = "src/content/blog/";

/**
 * URL of a post: `/posts/<folders>/<slug>/`. Folders are the post's parent
 * directories (except ones starting with "_"); the slug is the frontmatter
 * `slug`, else the file name. With `includeBase` false, returns the
 * `[...slug]` route param `<folders>/<slug>`.
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
