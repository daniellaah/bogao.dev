export function setupBackToTopButton() {
  const rootElement = document.documentElement;
  const container = document.querySelector<HTMLElement>("#btt-btn-container");
  const button = document.querySelector<HTMLElement>(
    "[data-button='back-to-top']"
  );
  if (!container || !button) return;

  const scrollToTop = () => {
    rootElement.scrollTop = 0;
  };
  button.addEventListener("click", scrollToTop);

  let lastVisible: boolean | null = null;
  const updateVisibility = () => {
    const scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
    const isVisible =
      scrollTotal > 0 && rootElement.scrollTop / scrollTotal > 0.3;

    if (isVisible === lastVisible) return;
    container.classList.toggle("opacity-100", isVisible);
    container.classList.toggle("translate-y-0", isVisible);
    container.classList.toggle("opacity-0", !isVisible);
    container.classList.toggle("translate-y-14", !isVisible);
    lastVisible = isVisible;
  };

  let frame = 0;
  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      updateVisibility();
    });
  };
  document.addEventListener("scroll", requestUpdate, { passive: true });

  return () => {
    window.cancelAnimationFrame(frame);
    document.removeEventListener("scroll", requestUpdate);
  };
}
