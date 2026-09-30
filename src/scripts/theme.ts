import { onEveryPage } from "./lifecycle";

// The inline script in Layout.astro applies the same theme before first paint.
type Theme = "light" | "dark";

const THEME_KEY = "theme";
// Matches --background for each theme in global.css.
const THEME_COLORS: Record<Theme, string> = {
  light: "#f6f1e7",
  dark: "#12151d",
};

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

function getStoredTheme(): Theme | null {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return isTheme(theme) ? theme : null;
  } catch {
    return null;
  }
}

const getSystemTheme = (): Theme => (prefersDark.matches ? "dark" : "light");

function getCurrentTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : (getStoredTheme() ?? getSystemTheme());
}

// `color-scheme` follows data-theme in global.css.
function setDocumentTheme(doc: Document, theme: Theme) {
  doc.documentElement.dataset.theme = theme;
  doc
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", THEME_COLORS[theme]);
}

function applyTheme(theme: Theme) {
  setDocumentTheme(document, theme);

  const nextTheme = theme === "light" ? "dark" : "light";
  const button = document.querySelector("#theme-btn");
  button?.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  button?.setAttribute("title", `Switch to ${nextTheme} mode`);
  const label = document.querySelector("[data-theme-label]");
  if (label) label.textContent = nextTheme === "dark" ? "Dark" : "Light";
}

function setupTheme() {
  applyTheme(getCurrentTheme());

  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "light" ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // The theme still applies to this page if storage is blocked.
    }
    applyTheme(nextTheme);
  });
}

onEveryPage(setupTheme);

// Carry the theme into the incoming page before it is swapped in.
document.addEventListener("astro:before-swap", ({ newDocument }) =>
  setDocumentTheme(newDocument, getCurrentTheme())
);

prefersDark.addEventListener("change", () => {
  if (!getStoredTheme()) applyTheme(getSystemTheme());
});
