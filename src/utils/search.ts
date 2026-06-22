export type SearchRecordKind = "Post" | "Note" | "Project" | "Tag";

export type SearchRecord = {
  title: string;
  description: string;
  url: string;
  kind: SearchRecordKind;
  metaText: string;
  content: string;
};

export type RankedSearchRecord = SearchRecord & { score: number };

export type SearchKind = "all" | "posts" | "notes" | "projects" | "tags";

export type SearchKindEntry = {
  filter: SearchKind;
  label: string;
  recordKind: SearchRecordKind | null;
  scope: string;
};

export const escapeSearchHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const normalizeSearchText = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const isCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

export const splitSearchTerms = (value: string) => {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return isCjk(normalized) && !normalized.includes(" ")
    ? [normalized]
    : normalized.split(" ").filter(Boolean);
};

export const scoreSearchRecord = (
  record: SearchRecord,
  terms: string[]
): RankedSearchRecord | null => {
  const title = normalizeSearchText(record.title);
  const description = normalizeSearchText(record.description);
  const meta = normalizeSearchText(record.metaText);
  const content = normalizeSearchText(record.content);

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 12;
    else if (description.includes(term)) score += 8;
    else if (meta.includes(term)) score += 5;
    else if (content.includes(term)) score += 3;
    else return null;
  }

  return { ...record, score };
};
