import { copyText } from "./clipboard";

type Cleanup = () => void;

// A heading becomes the current TOC entry once its top scrolls above this line.
const TOC_ACTIVATION_LINE = 120;
const COPY_LABEL = "Copy";
const COPY_FEEDBACK_MS = 1200;

function setupProgressBar(): Cleanup {
  const container = document.createElement("div");
  container.className =
    "progress-container fixed top-0 z-10 h-1 w-full bg-background";

  const bar = document.createElement("div");
  bar.className =
    "progress-bar h-px w-full origin-left scale-x-0 bg-foreground";

  container.appendChild(bar);
  document.body.appendChild(container);

  const updateProgress = () => {
    const root = document.documentElement;
    const height = root.scrollHeight - root.clientHeight;
    const scrolled = height > 0 ? root.scrollTop / height : 0;
    bar.style.transform = `scaleX(${Math.min(Math.max(scrolled, 0), 1)})`;
  };

  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  return () => {
    document.removeEventListener("scroll", updateProgress);
    container.remove();
  };
}

function addHeadingLinks(article: HTMLElement) {
  for (const heading of article.querySelectorAll<HTMLElement>(
    "h2, h3, h4, h5, h6"
  )) {
    if (!heading.id || heading.querySelector(".heading-link")) continue;

    heading.classList.add("group");
    const link = document.createElement("a");
    link.className =
      "heading-link ms-2 no-underline opacity-75 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100";
    link.href = `#${heading.id}`;
    link.setAttribute(
      "aria-label",
      `Link to section: ${heading.textContent?.trim() ?? ""}`
    );

    const mark = document.createElement("span");
    mark.ariaHidden = "true";
    mark.textContent = "#";
    link.appendChild(mark);
    heading.appendChild(link);
  }
}

function attachCopyButtons(article: HTMLElement) {
  for (const codeBlock of article.querySelectorAll<HTMLPreElement>("pre")) {
    if (codeBlock.querySelector(".copy-code")) continue;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const hasFileNameOffset =
      getComputedStyle(codeBlock)
        .getPropertyValue("--file-name-offset")
        .trim() !== "";
    const topClass = hasFileNameOffset ? "top-(--file-name-offset)" : "-top-3";

    const button = document.createElement("button");
    button.type = "button";
    button.className = `copy-code chip absolute end-3 ${topClass} bg-surface-strong px-2 py-1 text-xs leading-4 text-foreground font-medium`;
    button.textContent = COPY_LABEL;
    button.setAttribute("aria-label", "Copy code");
    codeBlock.setAttribute("tabindex", "0");
    codeBlock.appendChild(button);

    codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);

    let resetTimer: number | undefined;
    button.addEventListener("click", async () => {
      const copied = await copyText(
        codeBlock.querySelector("code")?.innerText ?? ""
      );

      button.textContent = copied ? "Copied" : "Copy failed";
      button.dataset.copied = String(copied);
      button.setAttribute("aria-label", copied ? "Code copied" : "Copy failed");

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.textContent = COPY_LABEL;
        delete button.dataset.copied;
        button.setAttribute("aria-label", "Copy code");
      }, COPY_FEEDBACK_MS);
    });
  }
}

const getIdFromHash = (hash: string) => {
  const rawId = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

function setupActiveToc(article: HTMLElement): Cleanup | undefined {
  // Each TOC link points at "#<heading id>" (TocList.astro).
  const linkIds = new Map(
    Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"),
      link => [link, getIdFromHash(link.getAttribute("href") ?? "")] as const
    )
  );
  const linkedIds = new Set(linkIds.values());
  const headings = Array.from(
    article.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]")
  ).filter(heading => linkedIds.has(heading.id));

  if (!headings.length) return undefined;

  let activeId: string | null = null;
  const setActiveLink = (id: string) => {
    if (!id || id === activeId) return;
    activeId = id;

    for (const [link, linkId] of linkIds) {
      if (linkId === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const updateActiveLink = () => {
    let current = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > TOC_ACTIVATION_LINE) break;
      current = heading;
    }

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8;
    if (atBottom) current = headings[headings.length - 1];

    setActiveLink(current.id);
  };

  let frame = 0;
  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateActiveLink();
    });
  };

  const handleLinkClick = (event: Event) =>
    setActiveLink(linkIds.get(event.currentTarget as HTMLAnchorElement) ?? "");

  let hashTimer: number | undefined;
  const handleHashChange = () => {
    if (!window.location.hash) return;

    const id = getIdFromHash(window.location.hash);
    if (linkedIds.has(id)) setActiveLink(id);
    // Let a smooth scroll to the anchor settle before measuring again.
    window.clearTimeout(hashTimer);
    hashTimer = window.setTimeout(requestUpdate, 180);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("hashchange", handleHashChange);
  // Images and fonts that finish loading later can move the headings.
  window.addEventListener("load", requestUpdate, { once: true });
  for (const link of linkIds.keys()) {
    link.addEventListener("click", handleLinkClick);
  }

  if (window.location.hash) setActiveLink(getIdFromHash(window.location.hash));
  updateActiveLink();
  // Measure again once the swapped-in page has laid out.
  requestUpdate();

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(hashTimer);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    window.removeEventListener("hashchange", handleHashChange);
    window.removeEventListener("load", requestUpdate);
  };
}

/** Reading progress, heading anchors, code copy buttons and the active TOC. */
export function setupPostDetailsPage() {
  const article = document.getElementById("article");
  if (!article) return;

  addHeadingLinks(article);
  attachCopyButtons(article);
  const cleanups = [setupProgressBar(), setupActiveToc(article)];

  return () => {
    for (const cleanup of cleanups) cleanup?.();
  };
}
