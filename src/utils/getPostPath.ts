import type { CollectionEntry } from "astro:content";
import { getPath } from "./getPath";

export const getPostPath = (
  post: CollectionEntry<"blog">,
  includeBase = true
) => {
  const path = getPath(
    post.id,
    post.filePath,
    includeBase,
    post.data.slug ?? post.slug
  );

  return includeBase ? path : path.replace(/^\/+/, "");
};
