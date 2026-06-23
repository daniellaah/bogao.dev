import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

const MARKDOWN_EXT_PATTERN = /\.(md|mdx)$/i;

const hasNonLatin = value => /[^\x00-\x7F]/.test(value);

export const stripMarkdownExt = value =>
  value.replace(MARKDOWN_EXT_PATTERN, "");

export const slugifyStr = value =>
  hasNonLatin(value) ? kebabcase(value) : slugify(value, { lower: true });

export const getPathSegmentSlug = segment =>
  slugifyStr(stripMarkdownExt(segment));

export const getResolvedSlug = (id, explicitSlug) => {
  const rawSlug =
    explicitSlug?.trim() ||
    stripMarkdownExt(id.split("/").filter(Boolean).at(-1) ?? id);
  return getPathSegmentSlug(rawSlug);
};

export const slugifyForContent = (
  value,
  { stripMarkdownExt: shouldStripMarkdownExt = false } = {}
) => {
  const raw = slugifyStr(value);
  const slug = shouldStripMarkdownExt ? stripMarkdownExt(raw) : raw;
  return slug.replace(/^[-.\s]+|[-.\s]+$/g, "") || "untitled";
};
