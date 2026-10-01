import {
  addToggleIndicatorResizeSync,
  setActiveToggleButton,
} from "./toggleControls";

type TagSort = "az" | "popular";

export function setupTagsIndexPage() {
  const root = document.querySelector<HTMLElement>("[data-tags-index]");
  if (!root) return;

  const status = root.querySelector<HTMLElement>("[data-tags-status]");
  const sortToggle = root.querySelector<HTMLElement>("[data-tags-sort-toggle]");
  const sortButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-tag-sort]")
  );
  const cardGrid = root.querySelector<HTMLElement>("[data-tags-card-grid]");
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-tag-card]")
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!status || !sortToggle || !cardGrid) return;

  let currentSort: TagSort = "popular";

  if (reduceMotion.matches) {
    root.removeAttribute("data-tags-entering");
  } else {
    window.setTimeout(() => {
      root.removeAttribute("data-tags-entering");
    }, 620);
  }

  const compareCardNames = (cardA: HTMLElement, cardB: HTMLElement) =>
    (cardA.dataset.tagName ?? "").localeCompare(
      cardB.dataset.tagName ?? "",
      undefined,
      { sensitivity: "base", numeric: true }
    );

  const pulseBadges = () => {
    root.removeAttribute("data-sort-pulse");
    window.setTimeout(() => {
      root.setAttribute("data-sort-pulse", "true");
      window.setTimeout(() => {
        root.removeAttribute("data-sort-pulse");
      }, 260);
    }, 0);
  };

  const sortCards = () => {
    // A sort can interrupt the entrance animation.
    root.removeAttribute("data-tags-entering");
    for (const card of cards) {
      for (const animation of card.getAnimations()) animation.cancel();
    }

    const sortedCards = [...cards].sort(
      (cardA, cardB) =>
        (currentSort === "popular" &&
          Number(cardB.dataset.count ?? 0) -
            Number(cardA.dataset.count ?? 0)) ||
        compareCardNames(cardA, cardB)
    );

    if (reduceMotion.matches) {
      cardGrid.append(...sortedCards);
      return;
    }

    // FLIP: measure, reorder, then animate each card from its old position.
    const firstRects = new Map(
      cards.map(card => [card, card.getBoundingClientRect()] as const)
    );
    cardGrid.append(...sortedCards);

    const animations = sortedCards.flatMap(card => {
      const firstRect = firstRects.get(card)!;
      const lastRect = card.getBoundingClientRect();
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return [];

      return [
        card.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" },
          ],
          { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        ),
      ];
    });

    if (animations.length === 0) {
      pulseBadges();
      return;
    }

    Promise.allSettled(animations.map(animation => animation.finished)).then(
      pulseBadges
    );
  };

  const applyTagsState = () => {
    setActiveToggleButton(sortButtons, "tagSort", currentSort, sortToggle);

    status.textContent =
      currentSort === "popular"
        ? `Showing all ${cards.length} topics, sorted by popularity.`
        : `Showing all ${cards.length} topics, sorted A-Z.`;
  };

  for (const button of sortButtons) {
    button.addEventListener("click", () => {
      const nextSort = (button.dataset.tagSort ?? "az") as TagSort;
      if (nextSort === currentSort) return;

      currentSort = nextSort;
      sortCards();
      applyTagsState();
    });
  }

  applyTagsState();

  window.requestAnimationFrame(() => {
    sortToggle.dataset.inkReady = "true";
  });

  return addToggleIndicatorResizeSync(() => {
    setActiveToggleButton(sortButtons, "tagSort", currentSort, sortToggle);
  });
}
