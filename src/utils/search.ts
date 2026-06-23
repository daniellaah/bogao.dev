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

export type SearchRankOptions = {
  limit?: number;
  dedupe?: boolean;
  getDedupeKey?: (record: RankedSearchRecord) => string;
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

export const formatSearchResultSummary = (count: number, query: string) =>
  `${count} result${count > 1 ? "s" : ""} for ${query}`;

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

export const rankSearchRecords = (
  records: SearchRecord[],
  terms: string[],
  {
    limit = 20,
    dedupe = true,
    getDedupeKey = record => `${record.kind}:${record.url}`,
  }: SearchRankOptions = {}
) => {
  const ranked = records
    .map(record => scoreSearchRecord(record, terms))
    .filter((record): record is RankedSearchRecord => Boolean(record));

  const candidates = dedupe
    ? Array.from(
        ranked
          .reduce((deduped, record) => {
            const key = getDedupeKey(record);
            const current = deduped.get(key);
            if (!current || record.score > current.score) {
              deduped.set(key, record);
            }
            return deduped;
          }, new Map<string, RankedSearchRecord>())
          .values()
      )
    : ranked;

  return candidates
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);
};

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
