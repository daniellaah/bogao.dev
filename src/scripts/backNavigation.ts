export function storeBackUrl() {
  const mainContent: HTMLElement | null =
    document.querySelector("#main-content");
  const backUrl = mainContent?.dataset?.backurl;
  if (backUrl) {
    sessionStorage.setItem("backUrl", backUrl);
  }
}

export function updateBackButtonUrl() {
  const backButton: HTMLAnchorElement | null =
    document.querySelector("#back-button");

  const backUrl = sessionStorage.getItem("backUrl");

  if (backUrl && backButton) {
    backButton.href = backUrl;
  }
}
