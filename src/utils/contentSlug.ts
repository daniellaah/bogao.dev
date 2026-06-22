import { slugifyStr } from "./slugify";

const MARKDOWN_EXT_PATTERN = /\.(md|mdx)$/i;

const stripMarkdownExt = (value: string) =>
  value.replace(MARKDOWN_EXT_PATTERN, "");

const getEntryFileSlug = (id: string) =>
  stripMarkdownExt(id.split("/").filter(Boolean).at(-1) ?? id);

export const getPathSegmentSlug = (segment: string) =>
  slugifyStr(stripMarkdownExt(segment));

export const getResolvedSlug = (id: string, explicitSlug?: string) => {
  const rawSlug = explicitSlug?.trim() || getEntryFileSlug(id);
  return getPathSegmentSlug(rawSlug);
};
