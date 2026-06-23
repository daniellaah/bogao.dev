import { setActiveToggleButton } from "./toggleControls";

let cleanupPostFiltersInstance = () => {};

export function cleanupPostFiltersPage() {
  cleanupPostFiltersInstance();
  cleanupPostFiltersInstance = () => {};
}

export function setupPostFiltersPage() {
  const root = document.querySelector<HTMLElement>("[data-post-filters]");
  if (!root || root.dataset.initialized === "true") return;

  cleanupPostFiltersPage();

  const posts = Array.from(
    document.querySelectorAll<HTMLElement>("[data-post-list-item]")
  );
  const status = root.querySelector<HTMLElement>("[data-filter-status]");
  const yearButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-filter-year]")
  );
  const tagButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-filter-tag]")
  );
  const yearToggle = root.querySelector<HTMLElement>(
    '[data-filter-toggle="year"]'
  );
  const tagToggle = root.querySelector<HTMLElement>(
    '[data-filter-toggle="tag"]'
  );
  const validTags = new Set([
    "all",
    ...tagButtons.map(button => button.dataset.filterTag ?? "all"),
  ]);

  root.dataset.initialized = "true";

  const getParams = () => new URLSearchParams(window.location.search);

  const getFilter = () => {
    const params = getParams();
    const requestedTag = params.get("tag") || "all";
    return {
      year: params.get("year") || "all",
      tag: validTags.has(requestedTag) ? requestedTag : "all",
      invalidTag: !validTags.has(requestedTag),
    };
  };

  const updateUrl = (year: string, tag: string) => {
    const params = getParams();
    if (year === "all") params.delete("year");
    else params.set("year", year);
    if (tag === "all") params.delete("tag");
    else params.set("tag", tag);

    const suffix = params.toString();
    history.replaceState(
      history.state,
      "",
      suffix
        ? `${window.location.pathname}?${suffix}`
        : window.location.pathname
    );
  };

  const applyFilter = () => {
    const { year, tag, invalidTag } = getFilter();
    let visibleCount = 0;

    if (invalidTag) updateUrl(year, tag);

    for (const post of posts) {
      const yearMatches = year === "all" || post.dataset.postYear === year;
      const tagMatches =
        tag === "all" || (post.dataset.postTags ?? "").split(" ").includes(tag);
      const visible = yearMatches && tagMatches;

      post.hidden = !visible;
      if (visible) visibleCount += 1;
    }

    setActiveToggleButton(yearButtons, "filterYear", year, yearToggle);
    setActiveToggleButton(tagButtons, "filterTag", tag, tagToggle);

    if (status) {
      status.textContent =
        year === "all" && tag === "all"
          ? `Showing all ${posts.length} posts.`
          : `Showing ${visibleCount} post${visibleCount === 1 ? "" : "s"}.`;
    }
  };

  for (const button of yearButtons) {
    button.addEventListener("click", () => {
      const { tag } = getFilter();
      updateUrl(button.dataset.filterYear ?? "all", tag);
      applyFilter();
    });
  }

  for (const button of tagButtons) {
    button.addEventListener("click", () => {
      const { year } = getFilter();
      updateUrl(year, button.dataset.filterTag ?? "all");
      applyFilter();
    });
  }

  applyFilter();

  window.requestAnimationFrame(() => {
    yearToggle?.setAttribute("data-ink-ready", "true");
    tagToggle?.setAttribute("data-ink-ready", "true");
  });

  let resizeFrame = 0;
  const syncIndicators = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      const { year, tag } = getFilter();
      setActiveToggleButton(yearButtons, "filterYear", year, yearToggle);
      setActiveToggleButton(tagButtons, "filterTag", tag, tagToggle);
    });
  };

  window.addEventListener("resize", syncIndicators, { passive: true });
  cleanupPostFiltersInstance = () => {
    window.cancelAnimationFrame(resizeFrame);
    window.removeEventListener("resize", syncIndicators);
  };
}
