const THEME_KEY = "theme";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

type Theme = typeof LIGHT_THEME | typeof DARK_THEME;

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function getStoredTheme(): Theme | null {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === LIGHT_THEME || theme === DARK_THEME ? theme : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return prefersDark.matches ? DARK_THEME : LIGHT_THEME;
}

function getCurrentTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  return theme === LIGHT_THEME || theme === DARK_THEME
    ? theme
    : (getStoredTheme() ?? getSystemTheme());
}

function updateThemeControls(theme: Theme) {
  const button = document.querySelector<HTMLButtonElement>("#theme-btn");
  const label = document.querySelector<HTMLElement>("[data-theme-label]");
  const nextTheme = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;

  button?.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  button?.setAttribute("title", `Switch to ${nextTheme} mode`);

  if (label) {
    label.textContent = nextTheme === DARK_THEME ? "Dark" : "Light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>("meta[name='theme-color']")
    ?.setAttribute("content", theme === DARK_THEME ? "#181817" : "#ffffff");
  updateThemeControls(theme);
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // The selected theme still applies for the current page if storage is blocked.
  }
}

function bindThemeToggle() {
  const button = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (!button || button.dataset.themeBound === "true") return;

  button.dataset.themeBound = "true";
  button.addEventListener("click", () => {
    const nextTheme =
      getCurrentTheme() === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;

    storeTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

function setupTheme() {
  applyTheme(getCurrentTheme());
  bindThemeToggle();
}

setupTheme();

document.addEventListener("astro:after-swap", setupTheme);

document.addEventListener("astro:before-swap", event => {
  const theme = getCurrentTheme();
  const { newDocument } = event;

  newDocument.documentElement.dataset.theme = theme;
  newDocument.documentElement.style.colorScheme = theme;
  newDocument
    .querySelector<HTMLMetaElement>("meta[name='theme-color']")
    ?.setAttribute("content", theme === DARK_THEME ? "#181817" : "#ffffff");
});

prefersDark.addEventListener("change", () => {
  if (!getStoredTheme()) applyTheme(getSystemTheme());
});
