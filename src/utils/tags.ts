import { slugifyStr } from "./slugifyCore";

type TagSource = {
  tags: string[];
  draft?: boolean;
};

export type TagStat = {
  slug: string;
  tag: string;
  tagName: string;
  totalCount: number;
  postCount: number;
};

export const collectTagStats = (sources: TagSource[]) => {
  const tagMap = new Map<string, TagStat>();

  for (const source of sources.filter(entry => !entry.draft)) {
    const uniqueTags = new Map(
      source.tags.map(tagName => [slugifyStr(tagName), tagName] as const)
    );

    for (const [slug, tagName] of uniqueTags) {
      const current = tagMap.get(slug);
      const postCount = (current?.postCount ?? 0) + 1;
      const totalCount = (current?.totalCount ?? 0) + 1;

      tagMap.set(slug, {
        slug,
        tag: slug,
        tagName: current?.tagName ?? tagName,
        totalCount,
        postCount,
      });
    }
  }

  return Array.from(tagMap.values());
};
