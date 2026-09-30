// Plain text for the search index: drops code, images, math and HTML tags,
// keeps link text and hyphenated words ("LLM-as-judge").
export const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    // Inline math as remark-math reads it: no space inside the dollars, so
    // prices like "$5 to $10" survive.
    .replace(/\$(?=\S)[^$\n]*?\S\$|\$\S\$/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/[#>*_~|]/g, " ")
    // Hyphens that are not inside a word: list bullets, rules, dashes.
    .replace(/(?<![\p{L}\p{N}])-+|-+(?![\p{L}\p{N}])/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
