import {
  addToggleIndicatorResizeSync,
  setActiveToggleButton,
} from "./toggleControls";
import { getCurrentUrlSearchParams, replaceCurrentUrlSearch } from "./urlState";

export function setupPostFiltersPage() {
  const root = document.querySelector<HTMLElement>("[data-post-filters]");
  if (!root) return;

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
  const validYears = new Set([
    "all",
    ...yearButtons.map(button => button.dataset.filterYear ?? "all"),
  ]);
  const validTags = new Set([
    "all",
    ...tagButtons.map(button => button.dataset.filterTag ?? "all"),
  ]);

  // Unknown values in a shared or stale URL fall back to "all".
  const getFilter = () => {
    const params = getCurrentUrlSearchParams();
    const requestedYear = params.get("year") || "all";
    const requestedTag = params.get("tag") || "all";
    const year = validYears.has(requestedYear) ? requestedYear : "all";
    const tag = validTags.has(requestedTag) ? requestedTag : "all";
    return {
      year,
      tag,
      isNormalized: year === requestedYear && tag === requestedTag,
    };
  };

  const updateUrl = (year: string, tag: string) => {
    const params = getCurrentUrlSearchParams();
    if (year === "all") params.delete("year");
    else params.set("year", year);
    if (tag === "all") params.delete("tag");
    else params.set("tag", tag);

    replaceCurrentUrlSearch(params);
  };

  const syncToggles = (year: string, tag: string) => {
    setActiveToggleButton(yearButtons, "filterYear", year, yearToggle);
    setActiveToggleButton(tagButtons, "filterTag", tag, tagToggle);
  };

  const applyFilter = () => {
    const { year, tag, isNormalized } = getFilter();
    let visibleCount = 0;

    if (!isNormalized) updateUrl(year, tag);

    for (const post of posts) {
      const yearMatches = year === "all" || post.dataset.postYear === year;
      const tagMatches =
        tag === "all" || (post.dataset.postTags ?? "").split(" ").includes(tag);
      const visible = yearMatches && tagMatches;

      post.hidden = !visible;
      if (visible) visibleCount += 1;
    }

    syncToggles(year, tag);

    if (status) {
      status.textContent =
        year === "all" && tag === "all"
          ? ""
          : `Showing ${visibleCount} post${visibleCount === 1 ? "" : "s"}.`;
    }
  };

  for (const button of yearButtons) {
    button.addEventListener("click", () => {
      updateUrl(button.dataset.filterYear ?? "all", getFilter().tag);
      applyFilter();
    });
  }

  for (const button of tagButtons) {
    button.addEventListener("click", () => {
      updateUrl(getFilter().year, button.dataset.filterTag ?? "all");
      applyFilter();
    });
  }

  applyFilter();

  window.requestAnimationFrame(() => {
    yearToggle?.setAttribute("data-ink-ready", "true");
    tagToggle?.setAttribute("data-ink-ready", "true");
  });

  return addToggleIndicatorResizeSync(() => {
    const { year, tag } = getFilter();
    syncToggles(year, tag);
  });
}
