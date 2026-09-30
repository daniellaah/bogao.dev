const BACK_URL_KEY = "backUrl";
const BACK_LABEL_KEY = "backLabel";

const readStorage = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Back links fall back to their server-rendered target.
  }
};

/**
 * Remember the current page as the target of detail-page back links, if it is
 * one: list pages mark their <main> with `data-back-label`. The URL keeps the
 * query string, so filters set on the page survive the round trip. Call again
 * whenever the page rewrites its own URL.
 */
export function storeBackUrl() {
  const main = document.querySelector<HTMLElement>(
    "#main-content[data-back-label]"
  );
  if (!main) return;

  writeStorage(BACK_URL_KEY, `${location.pathname}${location.search}`);
  writeStorage(BACK_LABEL_KEY, main.dataset.backLabel ?? "");
}

/** Point the back button at the last list page the reader came from. */
export function updateBackButton() {
  const button = document.querySelector<HTMLAnchorElement>("#back-button");
  const backUrl = readStorage(BACK_URL_KEY);
  if (!button || !backUrl) return;

  button.href = backUrl;

  const label = readStorage(BACK_LABEL_KEY);
  const labelElement = button.querySelector("[data-back-button-label]");
  if (label && labelElement) labelElement.textContent = label;
}

export function setupBackNavigation() {
  storeBackUrl();
  updateBackButton();
}
