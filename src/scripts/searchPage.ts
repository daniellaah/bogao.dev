import {
  SEARCH_LOAD_ERROR_MESSAGE,
  createSearchIndexLoader,
  escapeSearchHtml,
  formatNoSearchResults,
  formatSearchResultSummary,
  normalizeSearchText,
  rankSearchRecords,
  splitSearchTerms,
  type RankedSearchRecord,
  type SearchKind,
  type SearchKindEntry,
  type SearchRecord,
  type SearchRecordKind,
} from "../utils/search";
import { replaceCurrentUrlSearch } from "./urlState";

export function setupSearchPage() {
  const input = document.querySelector<HTMLInputElement>("#search-input");
  const clearButton =
    document.querySelector<HTMLButtonElement>("#search-clear");
  const status = document.querySelector<HTMLParagraphElement>("#search-status");
  const results = document.querySelector<HTMLUListElement>("#search-results");
  const kindButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-search-kind]")
  );
  const kindData =
    document.querySelector<HTMLScriptElement>("#search-kind-data");

  if (!input || !clearButton || !status || !results || !kindData) return;
  if (input.dataset.initialized === "true") return;

  input.dataset.initialized = "true";
  const searchKindEntries = JSON.parse(
    kindData.textContent ?? "[]"
  ) as SearchKindEntry[];
  const searchKindToRecordKind = Object.fromEntries(
    searchKindEntries.map(kind => [kind.filter, kind.recordKind])
  ) as Record<SearchKind, SearchRecordKind | null>;
  const searchKindToScope = Object.fromEntries(
    searchKindEntries.map(kind => [kind.filter, kind.scope])
  ) as Record<SearchKind, string>;

  const buildExcerpt = (content: string, terms: string[]) => {
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

  const getSearchKind = () => {
    const rawKind = new URLSearchParams(window.location.search).get("type");
    return rawKind &&
      Object.prototype.hasOwnProperty.call(searchKindToRecordKind, rawKind)
      ? (rawKind as SearchKind)
      : "all";
  };

  const setSearchKind = (kind: SearchKind) => {
    for (const button of kindButtons) {
      const isActive = button.dataset.searchKind === kind;
      button.toggleAttribute("data-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    }
  };

  const getVisibleRecords = (records: SearchRecord[], kind: SearchKind) => {
    const recordKind = searchKindToRecordKind[kind];
    return recordKind
      ? records.filter(record => record.kind === recordKind)
      : records;
  };

  const getScopeText = (kind: SearchKind) => searchKindToScope[kind];

  const renderEmptyPrompt = (kind: SearchKind) => {
    status.textContent = `Type a keyword to search across ${getScopeText(kind)}.`;
    results.innerHTML = "";
  };

  const renderResults = (
    records: SearchRecord[],
    query: string,
    kind: SearchKind
  ) => {
    const terms = splitSearchTerms(query);
    const visibleRecords = getVisibleRecords(records, kind);

    if (!terms.length) {
      renderEmptyPrompt(kind);
      return;
    }

    const sorted = rankSearchRecords(visibleRecords, terms);

    if (!sorted.length) {
      status.textContent = `${formatNoSearchResults(query)} in ${getScopeText(kind)}`;
      results.innerHTML = "";
      return;
    }

    status.textContent = `${formatSearchResultSummary(sorted.length, query)} in ${getScopeText(kind)}`;

    results.innerHTML = sorted
      .map((record: RankedSearchRecord) => {
        const excerpt = buildExcerpt(
          record.content || record.description,
          terms
        );
        return `
            <li class="sketch-list-row py-5">
              <a href="${escapeSearchHtml(record.url)}" class="hand-underline-trigger block">
                <div class="flex items-baseline justify-between gap-4">
                  <span class="hand-underline content-title min-w-0 text-lg font-medium">
                    ${escapeSearchHtml(record.title)}
                  </span>
                  <span class="notebook-kicker shrink-0">${escapeSearchHtml(record.kind)}</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-graphite">${escapeSearchHtml(record.description)}</p>
                <p class="mt-2 text-sm leading-6 text-graphite/80">${escapeSearchHtml(excerpt)}</p>
              </a>
            </li>
          `;
      })
      .join("");
  };

  const updateUrl = (query: string, kind: SearchKind) => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query);
    else params.delete("q");
    if (kind === "all") params.delete("type");
    else params.set("type", kind);

    replaceCurrentUrlSearch(params);
  };

  const loadSearchRecords = createSearchIndexLoader();

  const loadRecords = async (showLoading = false) => {
    if (showLoading) status.textContent = "Loading search index...";
    return loadSearchRecords();
  };

  const runSearch = async (query: string, kind: SearchKind) => {
    if (!splitSearchTerms(query).length) {
      renderEmptyPrompt(kind);
      return;
    }

    try {
      const records = await loadRecords(true);
      renderResults(records, input.value, getSearchKind());
    } catch {
      status.textContent = SEARCH_LOAD_ERROR_MESSAGE;
    }
  };

  const initialQuery =
    new URLSearchParams(window.location.search).get("q") ?? "";
  const initialKind = getSearchKind();

  input.value = initialQuery;
  setSearchKind(initialKind);

  input.addEventListener(
    "focus",
    () => {
      void loadRecords().catch(() => {
        // Retry state is reset inside createSearchIndexLoader.
      });
    },
    { once: true }
  );

  input.addEventListener("input", (event: Event) => {
    const query = (event.currentTarget as HTMLInputElement).value;
    const kind = getSearchKind();
    updateUrl(query, kind);
    void runSearch(query, kind);
  });

  for (const button of kindButtons) {
    button.addEventListener("click", () => {
      const kind = (button.dataset.searchKind ?? "all") as SearchKind;
      setSearchKind(kind);
      updateUrl(input.value, kind);
      void runSearch(input.value, kind);
    });
  }

  clearButton.addEventListener("click", () => {
    input.value = "";
    const kind = getSearchKind();
    updateUrl("", kind);
    renderEmptyPrompt(kind);
    input.focus();
  });

  if (initialQuery.trim()) void runSearch(initialQuery, initialKind);
  else renderEmptyPrompt(initialKind);
}
