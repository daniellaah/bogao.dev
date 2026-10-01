const GISCUS_ORIGIN = "https://giscus.app";

const giscusTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/**
 * Loads giscus into the page's `.giscus` container, if it has one, and keeps
 * its theme in step with the site's light/dark toggle.
 */
export function setupComments() {
  const host = document.querySelector<HTMLElement>(".giscus[data-giscus-repo]");
  if (!host) return;

  const { giscusRepo, giscusRepoId, giscusCategory, giscusCategoryId } =
    host.dataset;
  const script = document.createElement("script");
  script.src = `${GISCUS_ORIGIN}/client.js`;
  script.async = true;
  script.crossOrigin = "anonymous";
  Object.entries({
    repo: giscusRepo,
    "repo-id": giscusRepoId,
    category: giscusCategory,
    "category-id": giscusCategoryId,
    // One discussion per post URL; "strict" matches the path exactly.
    mapping: "pathname",
    strict: "1",
    "reactions-enabled": "1",
    "emit-metadata": "0",
    "input-position": "top",
    theme: giscusTheme(),
    lang: host.dataset.giscusLang ?? "en",
    loading: "lazy",
  }).forEach(([key, value]) => script.setAttribute(`data-${key}`, value ?? ""));
  host.after(script);

  const observer = new MutationObserver(() => {
    host
      .querySelector<HTMLIFrameElement>("iframe.giscus-frame")
      ?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: giscusTheme() } } },
        GISCUS_ORIGIN
      );
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}
