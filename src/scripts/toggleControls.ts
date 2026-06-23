const syncToggleIndicator = (
  toggle: HTMLElement | null,
  activeButton: HTMLButtonElement | undefined
) => {
  if (!toggle || !activeButton) return;

  toggle.style.setProperty(
    "--sort-indicator-x",
    `${activeButton.offsetLeft}px`
  );
  toggle.style.setProperty("--sort-indicator-y", `${activeButton.offsetTop}px`);
  toggle.style.setProperty(
    "--sort-indicator-width",
    `${activeButton.offsetWidth}px`
  );
  toggle.style.setProperty(
    "--sort-indicator-height",
    `${activeButton.offsetHeight}px`
  );
};

export const addToggleIndicatorResizeSync = (syncIndicator: () => void) => {
  let resizeFrame = 0;
  const syncOnResize = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(syncIndicator);
  };

  window.addEventListener("resize", syncOnResize, { passive: true });

  return () => {
    window.cancelAnimationFrame(resizeFrame);
    window.removeEventListener("resize", syncOnResize);
  };
};

export const setActiveToggleButton = (
  buttons: HTMLButtonElement[],
  dataKey: string,
  value: string,
  toggle: HTMLElement | null
) => {
  let activeButton: HTMLButtonElement | undefined;

  for (const button of buttons) {
    const isActive = button.dataset[dataKey] === value;
    button.toggleAttribute("data-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    if (isActive) activeButton = button;
  }

  syncToggleIndicator(toggle, activeButton);
};
