import { slugifyStr } from "./slugifyCore";

export type TagStat = {
  slug: string;
  tagName: string;
  count: number;
};

export const getTagPath = (tagSlug: string) => `/tags/${tagSlug}/`;

/**
 * Tags across the given (published) posts, sorted by slug. Each post counts
 * once per tag; spellings that slugify the same share one entry, named by the
 * first spelling seen.
 */
export const collectTagStats = (posts: { data: { tags: string[] } }[]) => {
  const stats = new Map<string, TagStat>();

  for (const { data } of posts) {
    const slugs = new Set<string>();
    for (const tagName of data.tags) {
      const slug = slugifyStr(tagName);
      if (slugs.has(slug)) continue;
      slugs.add(slug);

      const stat = stats.get(slug);
      if (stat) stat.count += 1;
      else stats.set(slug, { slug, tagName, count: 1 });
    }
  }

  return Array.from(stats.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug)
  );
};
