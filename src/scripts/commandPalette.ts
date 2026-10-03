import {
  SEARCH_LOAD_ERROR_MESSAGE,
  escapeSearchHtml,
  formatNoSearchResults,
  formatSearchResultSummary,
  highlightSearchTerms,
  rankSearchRecords,
  splitSearchTerms,
  type SearchRecord,
} from "../utils/search";
import { loadSearchIndex } from "./searchIndex";

export function setupCommandPalettePage() {
  const dialog = document.querySelector<HTMLDialogElement>("#command-palette");
  const input = document.querySelector<HTMLInputElement>(
    "#command-palette-input"
  );
  const status = document.querySelector<HTMLElement>("#command-palette-status");
  const results = document.querySelector<HTMLUListElement>(
    "#command-palette-results"
  );
  const resultsPanel = document.querySelector<HTMLElement>(
    "#command-palette-results-panel"
  );
  const thinking = document.querySelector<HTMLElement>(
    "#command-palette-thinking"
  );
  if (!dialog || !input || !status || !results || !resultsPanel || !thinking) {
    return;
  }

  // Bumped by every search and every opening, so a slow index load never
  // renders stale results.
  let searchRunId = 0;

  const setThinking = (active: boolean) => {
    thinking.classList.toggle("is-active", active);
    input.setAttribute("aria-busy", String(active));
  };

  const renderResults = (records: SearchRecord[], query: string) => {
    const terms = splitSearchTerms(query);
    setThinking(false);
    resultsPanel.hidden = !terms.length;
    if (!terms.length) {
      status.textContent = "";
      results.innerHTML = "";
      return;
    }

    const ranked = rankSearchRecords(records, terms, 8);
    if (!ranked.length) {
      status.textContent = formatNoSearchResults(query);
      results.innerHTML = "";
      return;
    }

    status.textContent = formatSearchResultSummary(ranked.length, query);
    results.innerHTML = ranked
      .map(
        record => `
            <li class="command-palette__result">
              <a href="${escapeSearchHtml(record.url)}" class="hover-underline-trigger block">
                <div class="flex items-baseline gap-3">
                  <span class="hover-underline min-w-0 truncate text-base font-medium">
                    ${highlightSearchTerms(record.title, terms)}
                  </span>
                  <span class="notebook-kicker shrink-0">${escapeSearchHtml(record.kind)}</span>
                </div>
                <p class="mt-1 truncate text-sm text-graphite">${highlightSearchTerms(record.description || record.metaText, terms)}</p>
              </a>
            </li>
          `
      )
      .join("");
  };

  const runSearch = async () => {
    const query = input.value.trim();
    const runId = ++searchRunId;
    if (!splitSearchTerms(query).length) {
      renderResults([], "");
      return;
    }

    setThinking(true);
    resultsPanel.hidden = false;
    status.textContent = "Thinking through the notebook...";

    try {
      const records = await loadSearchIndex();
      if (runId === searchRunId && dialog.open) renderResults(records, query);
    } catch {
      if (runId !== searchRunId) return;
      setThinking(false);
      status.textContent = SEARCH_LOAD_ERROR_MESSAGE;
    }
  };

  const openPalette = () => {
    if (!dialog.open) {
      // Start empty. Resetting here rather than on "close" keeps it
      // independent of when the browser dispatches that event.
      searchRunId += 1;
      input.value = "";
      renderResults([], "");
      dialog.showModal();
    }
    input.focus();
    // Warm the index while the reader types.
    void loadSearchIndex().catch(() => {
      // The loader resets itself so the next search retries.
    });
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPalette();
    }
  };

  document.addEventListener("keydown", handleKeydown);
  input.addEventListener("input", () => void runSearch());
  // Clicks inside the panel target its content; only the backdrop
  // targets the dialog element itself.
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  for (const button of dialog.querySelectorAll("[data-command-close]")) {
    button.addEventListener("click", () => dialog.close());
  }
  for (const link of document.querySelectorAll("[data-command-open]")) {
    link.addEventListener("click", event => {
      event.preventDefault();
      openPalette();
    });
  }

  // The dialog and its triggers are replaced on every page swap; only the
  // document listener outlives the page.
  return () => {
    document.removeEventListener("keydown", handleKeydown);
    if (dialog.open) dialog.close();
  };
}
