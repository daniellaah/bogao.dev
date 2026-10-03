import {
  SEARCH_KINDS,
  SEARCH_LOAD_ERROR_MESSAGE,
  buildSearchExcerpt,
  escapeSearchHtml,
  formatSearchEmptyPrompt,
  formatNoSearchResults,
  formatSearchResultSummary,
  highlightSearchTerms,
  rankSearchRecords,
  splitSearchTerms,
  type SearchKind,
  type SearchRecord,
} from "../utils/search";
import { loadSearchIndex } from "./searchIndex";
import { setActiveToggleButton } from "./toggleControls";
import { getCurrentUrlSearchParams, replaceCurrentUrlSearch } from "./urlState";

const [DEFAULT_KIND] = SEARCH_KINDS;

// Unknown values in a shared or stale URL fall back to the default.
const findKind = (filter: string | null | undefined) =>
  SEARCH_KINDS.find(kind => kind.filter === filter) ?? DEFAULT_KIND;

export function setupSearchPage() {
  const input = document.querySelector<HTMLInputElement>("#search-input");
  const clearButton =
    document.querySelector<HTMLButtonElement>("#search-clear");
  const status = document.querySelector<HTMLParagraphElement>("#search-status");
  const results = document.querySelector<HTMLUListElement>("#search-results");
  const kindButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-search-kind]")
  );

  if (!input || !clearButton || !status || !results) return;

  const getSearchKind = () => findKind(getCurrentUrlSearchParams().get("type"));

  const renderEmptyPrompt = (kind: SearchKind) => {
    status.textContent = formatSearchEmptyPrompt(kind.scope);
    results.innerHTML = "";
  };

  const renderResults = (
    records: SearchRecord[],
    query: string,
    kind: SearchKind
  ) => {
    const terms = splitSearchTerms(query);
    if (!terms.length) {
      renderEmptyPrompt(kind);
      return;
    }

    const ranked = rankSearchRecords(
      kind.recordKind
        ? records.filter(record => record.kind === kind.recordKind)
        : records,
      terms
    );
    if (!ranked.length) {
      status.textContent = `${formatNoSearchResults(query)} in ${kind.scope}`;
      results.innerHTML = "";
      return;
    }

    status.textContent = `${formatSearchResultSummary(ranked.length, query)} in ${kind.scope}`;
    results.innerHTML = ranked
      .map(record => {
        // Body text only adds context when there is body text to show.
        const excerpt = record.content
          ? `<p class="mt-2 text-sm leading-6 text-graphite">${highlightSearchTerms(buildSearchExcerpt(record.content, terms), terms)}</p>`
          : "";
        return `
            <li class="list-row py-5">
              <a href="${escapeSearchHtml(record.url)}" class="hover-underline-trigger block">
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span class="hover-underline min-w-0 text-lg font-medium">
                    ${highlightSearchTerms(record.title, terms)}
                  </span>
                  <span class="notebook-kicker shrink-0">${escapeSearchHtml(record.kind)}</span>
                </div>
                <p class="mt-2 text-sm leading-6">${highlightSearchTerms(record.description, terms)}</p>
                ${excerpt}
              </a>
            </li>
          `;
      })
      .join("");
  };

  const runSearch = async (query: string, kind: SearchKind) => {
    if (!splitSearchTerms(query).length) {
      renderEmptyPrompt(kind);
      return;
    }

    status.textContent = "Loading search index...";
    try {
      // The input and URL may have changed while the index loaded.
      renderResults(await loadSearchIndex(), input.value, getSearchKind());
    } catch {
      status.textContent = SEARCH_LOAD_ERROR_MESSAGE;
    }
  };

  // Keeps the query and kind in the URL, then shows their results.
  const search = (query: string, kind: SearchKind) => {
    const params = getCurrentUrlSearchParams();
    if (query.trim()) params.set("q", query);
    else params.delete("q");
    if (kind === DEFAULT_KIND) params.delete("type");
    else params.set("type", kind.filter);
    replaceCurrentUrlSearch(params);

    void runSearch(query, kind);
  };

  const initialKind = getSearchKind();
  input.value = getCurrentUrlSearchParams().get("q") ?? "";
  setActiveToggleButton(kindButtons, "searchKind", initialKind.filter, null);

  // Warm the index before the first keystroke.
  input.addEventListener(
    "focus",
    () => {
      void loadSearchIndex().catch(() => {
        // The loader resets itself so the next search retries.
      });
    },
    { once: true }
  );

  input.addEventListener("input", () => search(input.value, getSearchKind()));

  for (const button of kindButtons) {
    button.addEventListener("click", () => {
      const kind = findKind(button.dataset.searchKind);
      setActiveToggleButton(kindButtons, "searchKind", kind.filter, null);
      search(input.value, kind);
    });
  }

  clearButton.addEventListener("click", () => {
    input.value = "";
    search("", getSearchKind());
    input.focus();
  });

  void runSearch(input.value, initialKind);
}
