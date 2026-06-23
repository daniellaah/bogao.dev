import {
  SEARCH_LOAD_ERROR_MESSAGE,
  createSearchIndexLoader,
  escapeSearchHtml,
  formatNoSearchResults,
  formatSearchResultSummary,
  rankSearchRecords,
  splitSearchTerms,
  type SearchRecord,
} from "../utils/search";

type CommandWindow = Window & {
  __commandPaletteBindingCleanup?: () => void;
};

const COMMAND_PALETTE_CLOSE_MS = 220;

export function cleanupCommandPaletteBindings() {
  (window as CommandWindow).__commandPaletteBindingCleanup?.();
  (window as CommandWindow).__commandPaletteBindingCleanup = undefined;
}

export function setupCommandPalettePage() {
  cleanupCommandPaletteBindings();

  const root = document.querySelector<HTMLElement>("#command-palette");
  const panel = document.querySelector<HTMLElement>(".command-palette__panel");
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
  const closeButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-command-close]")
  );
  const openButtons = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-command-open]")
  );

  if (
    !root ||
    !panel ||
    !input ||
    !status ||
    !results ||
    !resultsPanel ||
    !thinking
  )
    return;

  const loadRecords = createSearchIndexLoader();
  let previousActiveElement: Element | null = null;
  let closeTimer: number | undefined;
  let searchRunId = 0;
  let searchTrigger: HTMLElement | null = null;

  const setThinking = (active: boolean) => {
    thinking.classList.toggle("is-active", active);
    input.setAttribute("aria-busy", String(active));
  };

  const setResultsPanelVisible = (visible: boolean) => {
    resultsPanel.toggleAttribute("data-empty", !visible);
    resultsPanel.setAttribute("aria-hidden", String(!visible));
  };

  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  };

  const shouldAnimateClose = () =>
    window.matchMedia("(min-width: 64rem)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setNavSearchActive = (active: boolean) => {
    searchTrigger?.toggleAttribute("data-command-active", active);
  };

  const renderResults = (records: SearchRecord[], query: string) => {
    const terms = splitSearchTerms(query);
    if (!terms.length) {
      status.textContent = "";
      results.innerHTML = "";
      setResultsPanelVisible(false);
      setThinking(false);
      return;
    }

    setResultsPanelVisible(true);

    const sorted = rankSearchRecords(records, terms, {
      limit: 8,
      dedupe: false,
    });

    setThinking(false);

    if (!sorted.length) {
      status.textContent = formatNoSearchResults(query);
      results.innerHTML = "";
      return;
    }

    status.textContent = formatSearchResultSummary(sorted.length, query);
    results.innerHTML = sorted
      .map(
        record => `
            <li class="command-palette__result">
              <a href="${escapeSearchHtml(record.url)}" class="hand-underline-trigger block">
                <div class="flex items-baseline justify-between gap-4">
                  <span class="hand-underline content-title min-w-0 truncate text-base font-medium">
                    ${escapeSearchHtml(record.title)}
                  </span>
                  <span class="notebook-kicker shrink-0">${escapeSearchHtml(record.kind)}</span>
                </div>
                <p class="mt-1 truncate text-sm text-graphite">${escapeSearchHtml(record.description || record.metaText)}</p>
              </a>
            </li>
          `
      )
      .join("");
  };

  const runSearch = async () => {
    const query = input.value.trim();
    const currentRunId = ++searchRunId;
    if (!splitSearchTerms(query).length) {
      renderResults([], "");
      return;
    }

    setThinking(true);
    setResultsPanelVisible(true);
    status.textContent = "Thinking through the notebook...";

    try {
      const records = await loadRecords();
      if (
        currentRunId !== searchRunId ||
        root.classList.contains("hidden") ||
        root.classList.contains("command-palette--closing")
      ) {
        return;
      }

      renderResults(records, query);
    } catch {
      if (currentRunId !== searchRunId) return;
      setThinking(false);
      status.textContent = SEARCH_LOAD_ERROR_MESSAGE;
    }
  };

  const finishClose = () => {
    closeTimer = undefined;
    root.hidden = true;
    root.classList.add("hidden");
    root.setAttribute("aria-hidden", "true");
    root.classList.remove(
      "command-palette--expanded",
      "command-palette--closing"
    );
    setNavSearchActive(false);
    input.value = "";
    renderResults([], "");
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  };

  const closePalette = () => {
    if (root.classList.contains("hidden")) return;

    clearCloseTimer();
    searchRunId += 1;
    input.blur();
    setThinking(false);

    if (!shouldAnimateClose()) {
      finishClose();
      return;
    }

    root.classList.add("command-palette--closing");
    window.requestAnimationFrame(() => {
      root.classList.remove("command-palette--expanded");
    });
    closeTimer = window.setTimeout(finishClose, COMMAND_PALETTE_CLOSE_MS);
  };

  const positionPalette = () => {
    const navWrap = document.querySelector<HTMLElement>("#top-nav-wrap");
    const siteBrand = document.querySelector<HTMLElement>(".site-brand");
    const firstNavItem = document.querySelector<HTMLElement>("[data-nav-item]");
    searchTrigger = document.querySelector<HTMLElement>("[data-command-open]");

    if (!navWrap || !firstNavItem || !searchTrigger) return;

    const navRect = navWrap.getBoundingClientRect();
    const brandRect = siteBrand?.getBoundingClientRect();
    const firstNavRect = firstNavItem.getBoundingClientRect();
    const searchRect = searchTrigger.getBoundingClientRect();
    const searchMarkRect = searchTrigger
      .querySelector<HTMLElement>(".search-nav-mark")
      ?.getBoundingClientRect();
    const brandGap = 24;
    const minWidth = 280;
    const targetLeft = brandRect
      ? brandRect.right + brandGap
      : firstNavRect.left;
    const minLeft = navRect.left + 12;
    const maxLeft = searchRect.right - minWidth;
    const left = Math.max(minLeft, Math.min(targetLeft, maxLeft));
    const width = searchRect.right - left;
    const inputHeight = 40;
    const top = searchRect.top + (searchRect.height - inputHeight) / 2;

    panel.style.setProperty("--command-top", `${Math.round(top)}px`);
    panel.style.setProperty("--command-left", `${Math.round(left)}px`);
    panel.style.setProperty("--command-width", `${Math.round(width)}px`);
    panel.style.setProperty(
      "--command-collapsed-scale",
      `${Math.min(1, (searchMarkRect?.width ?? searchRect.width) / width).toFixed(4)}`
    );
  };

  const openPalette = () => {
    clearCloseTimer();

    if (!root.classList.contains("hidden")) {
      root.classList.remove("command-palette--closing");
      root.classList.add("command-palette--expanded");
      root.hidden = false;
      root.setAttribute("aria-hidden", "false");
      setNavSearchActive(true);
      positionPalette();
      input.focus();
      return;
    }

    searchRunId += 1;
    previousActiveElement = document.activeElement;
    searchTrigger = document.querySelector<HTMLElement>("[data-command-open]");
    setNavSearchActive(true);
    root.hidden = false;
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    root.classList.remove(
      "command-palette--expanded",
      "command-palette--closing"
    );
    positionPalette();
    window.requestAnimationFrame(() => {
      root.classList.add("command-palette--expanded");
      input.focus();
    });
    void loadRecords().catch(() => {
      // Retry state is reset inside createSearchIndexLoader.
    });
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && key === "k") {
      event.preventDefault();
      openPalette();
      return;
    }

    if (event.key === "Escape" && !root.classList.contains("hidden")) {
      event.preventDefault();
      closePalette();
    }

    if (event.key === "Tab" && !root.classList.contains("hidden")) {
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        element => element.offsetParent !== null && element.tabIndex >= 0
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleResize = () => {
    if (!root.classList.contains("hidden")) positionPalette();
  };

  const handleInput = () => {
    void runSearch();
  };

  const handleOpenClick = (event: MouseEvent) => {
    event.preventDefault();
    openPalette();
  };

  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);
  input.addEventListener("input", handleInput);
  closeButtons.forEach(button =>
    button.addEventListener("click", closePalette)
  );
  openButtons.forEach(button =>
    button.addEventListener("click", handleOpenClick)
  );

  (window as CommandWindow).__commandPaletteBindingCleanup = () => {
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", handleResize);
    input.removeEventListener("input", handleInput);
    closeButtons.forEach(button =>
      button.removeEventListener("click", closePalette)
    );
    openButtons.forEach(button =>
      button.removeEventListener("click", handleOpenClick)
    );
    clearCloseTimer();
    setNavSearchActive(false);
  };
}
