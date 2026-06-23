import { collectTagStats } from "./tags";

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
  return collectTagStats(
    entries.map(({ data }) => ({ tags: data.tags, draft: data.draft }))
  )
    .map(
      ({ tag, tagName, totalCount }): Tag => ({
        tag,
        tagName,
        count: totalCount,
      })
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
};

export default getUniqueTags;
