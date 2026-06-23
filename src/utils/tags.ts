import { slugifyStr } from "./slugify";

export type TagKind = "post" | "note";

export type TagSource = {
  tags: string[];
  kind?: TagKind;
  draft?: boolean;
};

export type TagStat = {
  slug: string;
  tag: string;
  tagName: string;
  totalCount: number;
  count: number;
  postCount: number;
  noteCount: number;
};

export const collectTagStats = (sources: TagSource[]) => {
  const tagMap = new Map<string, TagStat>();

  for (const source of sources.filter(entry => !entry.draft)) {
    const uniqueTags = new Map(
      source.tags.map(tagName => [slugifyStr(tagName), tagName] as const)
    );

    for (const [slug, tagName] of uniqueTags) {
      const current = tagMap.get(slug);
      const postCount =
        (current?.postCount ?? 0) + (source.kind === "post" ? 1 : 0);
      const noteCount =
        (current?.noteCount ?? 0) + (source.kind === "note" ? 1 : 0);
      const totalCount = (current?.totalCount ?? 0) + 1;

      tagMap.set(slug, {
        slug,
        tag: slug,
        tagName: current?.tagName ?? tagName,
        totalCount,
        count: totalCount,
        postCount,
        noteCount,
      });
    }
  }

  return Array.from(tagMap.values());
};
