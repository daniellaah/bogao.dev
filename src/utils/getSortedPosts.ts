import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

export type SortedBlogPost = CollectionEntry<"blog"> & {
  data: CollectionEntry<"blog">["data"] & { pubDatetime: Date };
};

const hasPublishDate = (
  post: CollectionEntry<"blog">
): post is SortedBlogPost => Boolean(post.data.pubDatetime);

const getSortedPosts = (posts: CollectionEntry<"blog">[]) =>
  posts
    .filter(postFilter)
    .filter(hasPublishDate)
    .sort(
      (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
    );

export default getSortedPosts;
