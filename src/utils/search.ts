export type SearchRecordKind = "Post" | "Project" | "Tag";

export type SearchRecord = {
  title: string;
  description: string;
  url: string;
  kind: SearchRecordKind;
  metaText: string;
  content: string;
};

export type RankedSearchRecord = SearchRecord & { score: number };

export type SearchKind = "all" | "posts" | "projects" | "tags";

export type SearchKindEntry = {
  filter: SearchKind;
  label: string;
  recordKind: SearchRecordKind | null;
  scope: string;
};

export const SEARCH_LOAD_ERROR_MESSAGE = "Search failed to load.";

export const escapeSearchHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeSearchText = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

// Scripts written without spaces between words: a query in them is one term.
const CJK =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const isCjk = (value: string) => CJK.test(value);

export const splitSearchTerms = (value: string) => {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return isCjk(normalized) && !normalized.includes(" ")
    ? [normalized]
    : normalized.split(" ").filter(Boolean);
};

export const buildSearchExcerpt = (content: string, terms: string[]) => {
  const normalized = normalizeSearchText(content);
  const firstTerm = terms.find((term: string) => normalized.includes(term));
  if (!firstTerm) return content.slice(0, 160);

  const index = normalized.indexOf(firstTerm);
  const start = Math.max(0, index - 48);
  const end = Math.min(content.length, index + 112);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";

  return `${prefix}${content.slice(start, end).trim()}${suffix}`;
};

export const formatSearchResultSummary = (count: number, query: string) =>
  `${count} result${count > 1 ? "s" : ""} for ${query}`;

export const formatSearchEmptyPrompt = (scope: string) =>
  `Type a keyword to search across ${scope}.`;

export const formatSearchInputPlaceholder = (scope: string) =>
  `Search ${scope}`;

export const formatNoSearchResults = (query: string) =>
  `No results for ${query}`;

type NormalizedRecord = Record<
  "title" | "description" | "meta" | "content",
  string
>;

// Records come from one loaded index, so normalize each once rather than on
// every keystroke.
const normalizedRecords = new WeakMap<SearchRecord, NormalizedRecord>();

const getNormalizedRecord = (record: SearchRecord) => {
  let normalized = normalizedRecords.get(record);
  if (!normalized) {
    normalized = {
      title: normalizeSearchText(record.title),
      description: normalizeSearchText(record.description),
      meta: normalizeSearchText(record.metaText),
      content: normalizeSearchText(record.content),
    };
    normalizedRecords.set(record, normalized);
  }
  return normalized;
};

export const scoreSearchRecord = (
  record: SearchRecord,
  terms: string[]
): RankedSearchRecord | null => {
  const { title, description, meta, content } = getNormalizedRecord(record);

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

export const rankSearchRecords = (
  records: SearchRecord[],
  terms: string[],
  limit = 20
) =>
  records
    .map(record => scoreSearchRecord(record, terms))
    .filter((record): record is RankedSearchRecord => record !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);

export const createSearchIndexLoader = (
  fetcher: typeof fetch = fetch,
  url = "/search-index.json"
) => {
  let loadedRecords: SearchRecord[] | null = null;
  let recordsPromise: Promise<SearchRecord[]> | null = null;

  return async () => {
    if (loadedRecords) return loadedRecords;

    recordsPromise ??= fetcher(url).then(response => {
      if (!response.ok) throw new Error("Search index request failed.");
      return response.json() as Promise<SearchRecord[]>;
    });

    try {
      loadedRecords = await recordsPromise;
      return loadedRecords;
    } catch (error) {
      recordsPromise = null;
      throw error;
    }
  };
};
