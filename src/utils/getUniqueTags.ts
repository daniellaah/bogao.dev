import { slugifyStr } from "./slugify";

interface Tag {
  tag: string;
  tagName: string;
  count: number;
}

type TaggedEntry = {
  data: {
    tags: string[];
    draft?: boolean;
  };
};

const getUniqueTags = <T extends TaggedEntry>(entries: T[]) => {
  const tagMap = new Map<string, Tag>();

  for (const entry of entries.filter(({ data }) => !data.draft)) {
    const entryTags = new Map(
      entry.data.tags.map(tagName => [slugifyStr(tagName), tagName])
    );

    for (const [tag, tagName] of entryTags) {
      const current = tagMap.get(tag);
      tagMap.set(tag, {
        tag,
        tagName: current?.tagName ?? tagName,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return Array.from(tagMap.values()).sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );
};

export default getUniqueTags;
