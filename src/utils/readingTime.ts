const WORDS_PER_MINUTE = 230;
const CJK_CHARS_PER_MINUTE = 400;

const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g;

// Rough reading time for mixed English/CJK Markdown: CJK is counted by
// character, everything else by word. Frontmatter is not part of `body`.
export const getReadingMinutes = (markdown: string) => {
  const cjkChars = markdown.match(CJK)?.length ?? 0;
  const words = markdown
    .replace(CJK, " ")
    .split(/\s+/)
    .filter(token => /[\p{L}\p{N}]/u.test(token)).length;

  return Math.max(
    1,
    Math.round(words / WORDS_PER_MINUTE + cjkChars / CJK_CHARS_PER_MINUTE)
  );
};
