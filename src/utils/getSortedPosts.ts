import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

export type SortedBlogPost = CollectionEntry<"blog"> & {
  data: CollectionEntry<"blog">["data"] & { pubDatetime: Date };
};

const isPublishablePost = (
  post: CollectionEntry<"blog">
): post is SortedBlogPost => {
  const { data } = post;
  if (!data.pubDatetime) return false;

  const isPublishTimePassed =
    Date.now() > data.pubDatetime.getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

const getSortedPosts = (posts: CollectionEntry<"blog">[]) =>
  posts
    .filter(isPublishablePost)
    .sort(
      (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
    );

export default getSortedPosts;
