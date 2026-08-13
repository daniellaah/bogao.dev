import { getCollection, type CollectionEntry } from "astro:content";

const blogSourceFiles = import.meta.glob("/src/content/blog/**/*.{md,mdx}");

export default async function getBlogEntries(): Promise<
  CollectionEntry<"blog">[]
> {
  return Object.keys(blogSourceFiles).length > 0 ? getCollection("blog") : [];
}
