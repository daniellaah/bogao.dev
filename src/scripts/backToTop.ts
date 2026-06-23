type BackToTopWindow = Window & {
  __backToTopCleanup?: () => void;
};

export function setupBackToTopButton() {
  const rootElement = document.documentElement;
  const btnContainer =
    document.querySelector<HTMLElement>("#btt-btn-container");
  const backToTopBtn = document.querySelector<HTMLElement>(
    "[data-button='back-to-top']"
  );
  if (!rootElement || !btnContainer || !backToTopBtn) return;
  if (backToTopBtn.dataset.backToTopBound === "true") return;

  const visibleContainer = btnContainer;
  const backToTopWindow = window as BackToTopWindow;
  backToTopWindow.__backToTopCleanup?.();
  backToTopBtn.dataset.backToTopBound = "true";

  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };
  backToTopBtn.addEventListener("click", scrollToTop);

  let lastVisible: boolean | null = null;
  function handleScroll() {
    const scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
    const scrollTop = rootElement.scrollTop;
    const isVisible = scrollTotal > 0 && scrollTop / scrollTotal > 0.3;

    if (isVisible !== lastVisible) {
      visibleContainer.classList.toggle("opacity-100", isVisible);
      visibleContainer.classList.toggle("translate-y-0", isVisible);
      visibleContainer.classList.toggle("opacity-0", !isVisible);
      visibleContainer.classList.toggle("translate-y-14", !isVisible);
      lastVisible = isVisible;
    }
  }

  let ticking = false;
  const requestScrollUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
  document.addEventListener("scroll", requestScrollUpdate, { passive: true });

  const cleanupBackToTop = () => {
    backToTopBtn.removeEventListener("click", scrollToTop);
    document.removeEventListener("scroll", requestScrollUpdate);
    document.removeEventListener("astro:before-swap", cleanupBackToTop);
    delete backToTopBtn.dataset.backToTopBound;
    backToTopWindow.__backToTopCleanup = undefined;
  };

  backToTopWindow.__backToTopCleanup = cleanupBackToTop;
  document.addEventListener("astro:before-swap", cleanupBackToTop, {
    once: true,
  });
}
