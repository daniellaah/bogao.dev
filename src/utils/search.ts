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

// Moves `index` to the nearest space within `reach` in `direction`, so an
// excerpt starts and ends on whole words. Text without spaces (CJK) keeps it.
const snapToSpace = (
  text: string,
  index: number,
  direction: -1 | 1,
  reach = 24
) => {
  for (let offset = 0; offset <= reach; offset++) {
    const at = index + direction * offset;
    if (at <= 0 || at >= text.length) return index;
    if (text[at] === " ") return direction < 0 ? at + 1 : at;
  }
  return index;
};

/** About 160 characters of `content` around the first matching term. */
export const buildSearchExcerpt = (content: string, terms: string[]) => {
  const lower = content.toLowerCase();
  const matches = terms
    .map(term => lower.indexOf(term))
    .filter(index => index >= 0);
  const first = matches.length ? Math.min(...matches) : 0;

  const start = first > 48 ? snapToSpace(content, first - 48, -1) : 0;
  const end =
    start + 160 < content.length
      ? snapToSpace(content, start + 160, 1)
      : content.length;

  return `${start > 0 ? "…" : ""}${content.slice(start, end).trim()}${
    end < content.length ? "…" : ""
  }`;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Escaped HTML for `text` with each search term wrapped in <mark>. */
export const highlightSearchTerms = (text: string, terms: string[]) => {
  if (!terms.length) return escapeSearchHtml(text);

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  // With a capture group, split puts the matches at the odd indexes.
  return text
    .split(pattern)
    .map((part, index) =>
      index % 2
        ? `<mark>${escapeSearchHtml(part)}</mark>`
        : escapeSearchHtml(part)
    )
    .join("");
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
