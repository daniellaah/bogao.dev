const TOC_FIXED_HEADER_OFFSET = 120;

function createProgressBar() {
  if (document.querySelector(".progress-container")) return;

  const progressContainer = document.createElement("div");
  progressContainer.className =
    "progress-container fixed top-0 z-10 h-1 w-full bg-background";

  const progressBar = document.createElement("div");
  progressBar.className =
    "progress-bar h-px w-full origin-left scale-x-0 bg-foreground";
  progressBar.id = "myBar";

  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);
}

function updateScrollProgress(addCleanup) {
  const updateProgress = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = height > 0 ? winScroll / height : 0;
    const myBar = document.getElementById("myBar");

    if (myBar) {
      myBar.style.transform = `scaleX(${Math.min(Math.max(scrolled, 0), 1)})`;
    }
  };

  document.addEventListener("scroll", updateProgress, { passive: true });
  addCleanup(() => document.removeEventListener("scroll", updateProgress));
  updateProgress();
}

function addHeadingLinks() {
  const headings = Array.from(
    document.querySelectorAll(
      "#article h2, #article h3, #article h4, #article h5, #article h6"
    )
  );

  for (const heading of headings) {
    if (!heading.id || heading.querySelector(".heading-link")) continue;

    heading.classList.add("group");
    const link = document.createElement("a");
    link.className =
      "heading-link ms-2 no-underline opacity-75 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100";
    link.href = "#" + heading.id;

    const span = document.createElement("span");
    span.ariaHidden = "true";
    span.innerText = "#";
    link.appendChild(span);
    heading.appendChild(link);
  }
}

function attachCopyButtons() {
  const copyButtonLabel = "Copy";
  const codeBlocks = Array.from(document.querySelectorAll("pre"));

  for (const codeBlock of codeBlocks) {
    if (codeBlock.querySelector(".copy-code")) continue;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const computedStyle = getComputedStyle(codeBlock);
    const hasFileNameOffset =
      computedStyle.getPropertyValue("--file-name-offset").trim() !== "";
    const topClass = hasFileNameOffset ? "top-(--file-name-offset)" : "-top-3";

    const copyButton = document.createElement("button");
    copyButton.className = `copy-code sketch-chip absolute end-3 ${topClass} bg-surface-strong px-2 py-1 text-xs leading-4 text-foreground font-medium`;
    copyButton.innerHTML = copyButtonLabel;
    copyButton.setAttribute("aria-label", "Copy code");
    codeBlock.setAttribute("tabindex", "0");
    codeBlock.appendChild(copyButton);

    codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);

    copyButton.addEventListener("click", async () => {
      await copyCode(codeBlock, copyButton);
    });
  }

  async function copyCode(block, button) {
    const code = block.querySelector("code");
    const text = code?.innerText;

    await navigator.clipboard.writeText(text ?? "");

    button.innerText = "Copied";
    button.dataset.copied = "true";
    button.setAttribute("aria-label", "Code copied");

    setTimeout(() => {
      button.innerText = copyButtonLabel;
      delete button.dataset.copied;
      button.setAttribute("aria-label", "Copy code");
    }, 700);
  }
}

function initActiveToc(addCleanup) {
  window.__activeTocCleanup?.();
  window.__activeTocCleanup = undefined;

  const article = document.getElementById("article");
  if (!article) return false;

  const links = Array.from(document.querySelectorAll("[data-toc-link]"));
  const headings = Array.from(
    article.querySelectorAll("h2[id], h3[id], h4[id]")
  );
  const linkByHeadingId = new Map();

  if (!links.length || !headings.length) return false;

  const getIdFromHash = hash => {
    const rawId = hash.startsWith("#") ? hash.slice(1) : hash;
    try {
      return decodeURIComponent(rawId);
    } catch {
      return rawId;
    }
  };

  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#")) continue;

    linkByHeadingId.set(getIdFromHash(href), link);
  }

  const linkedHeadings = headings.filter(heading =>
    linkByHeadingId.has(heading.id)
  );

  if (!linkedHeadings.length) return false;

  let activeId = null;

  const setActiveTocLink = id => {
    if (!id || id === activeId) return;

    activeId = id;

    for (const link of links) {
      const href = link.getAttribute("href");
      const isActive = href?.startsWith("#") && getIdFromHash(href) === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  let hashUpdateTimer;
  let initialUpdateTimer = 0;

  const handleTocClick = event => {
    const hash = event.currentTarget.getAttribute("href");
    if (!hash?.startsWith("#")) return;

    setActiveTocLink(getIdFromHash(hash));
  };

  const handleHashChange = () => {
    if (!window.location.hash) return;

    const id = getIdFromHash(window.location.hash);
    if (linkByHeadingId.has(id)) {
      setActiveTocLink(id);
    }
    window.clearTimeout(hashUpdateTimer);
    hashUpdateTimer = window.setTimeout(requestActiveTocUpdate, 180);
  };

  let ticking = false;

  const updateActiveTocLink = () => {
    const activationLine = TOC_FIXED_HEADER_OFFSET;
    let currentHeading = linkedHeadings[0];

    for (const heading of linkedHeadings) {
      if (heading.getBoundingClientRect().top <= activationLine) {
        currentHeading = heading;
      } else {
        break;
      }
    }

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8
    ) {
      currentHeading = linkedHeadings[linkedHeadings.length - 1];
    }

    setActiveTocLink(currentHeading.id);
  };

  const requestActiveTocUpdate = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateActiveTocLink();
    });
  };

  const handleAstroPageLoad = () => {
    updateActiveTocLink();
    requestActiveTocUpdate();
  };

  window.addEventListener("scroll", requestActiveTocUpdate, { passive: true });
  window.addEventListener("resize", requestActiveTocUpdate);
  window.addEventListener("hashchange", handleHashChange);
  document.addEventListener("astro:page-load", handleAstroPageLoad, {
    once: true,
  });
  for (const link of links) {
    link.addEventListener("click", handleTocClick);
  }

  const cleanupActiveToc = () => {
    window.removeEventListener("scroll", requestActiveTocUpdate);
    window.removeEventListener("resize", requestActiveTocUpdate);
    window.removeEventListener("hashchange", handleHashChange);
    document.removeEventListener("astro:page-load", handleAstroPageLoad);
    for (const link of links) {
      link.removeEventListener("click", handleTocClick);
    }
    window.clearTimeout(hashUpdateTimer);
    window.clearTimeout(initialUpdateTimer);
    window.removeEventListener("load", requestActiveTocUpdate);
  };

  window.__activeTocCleanup = cleanupActiveToc;
  addCleanup(() => {
    if (window.__activeTocCleanup === cleanupActiveToc) {
      cleanupActiveToc();
      window.__activeTocCleanup = undefined;
    }
  });

  if (window.location.hash) {
    setActiveTocLink(getIdFromHash(window.location.hash));
  }

  updateActiveTocLink();
  requestAnimationFrame(requestActiveTocUpdate);
  initialUpdateTimer = window.setTimeout(requestActiveTocUpdate, 120);
  window.addEventListener("load", requestActiveTocUpdate, { once: true });
  return true;
}

function scrollToPageStartAfterSwap() {
  if (window.__postAfterSwapScroll) {
    document.removeEventListener(
      "astro:after-swap",
      window.__postAfterSwapScroll
    );
  }

  window.__postAfterSwapScroll = () => {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    window.__postAfterSwapScroll = undefined;
  };
  document.addEventListener("astro:after-swap", window.__postAfterSwapScroll, {
    once: true,
  });
}

export function setupPostDetailsPage() {
  if (!document.getElementById("article")) return;

  window.__postPageCleanup?.();

  const postPageCleanups = [];
  const addPostPageCleanup = cleanup => postPageCleanups.push(cleanup);
  const cleanupPostPage = () => {
    while (postPageCleanups.length) {
      postPageCleanups.pop()?.();
    }
    document.querySelector(".progress-container")?.remove();
    window.__postPageCleanup = undefined;
  };

  window.__postPageCleanup = cleanupPostPage;
  document.addEventListener("astro:before-swap", cleanupPostPage, {
    once: true,
  });
  addPostPageCleanup(() =>
    document.removeEventListener("astro:before-swap", cleanupPostPage)
  );

  createProgressBar();
  updateScrollProgress(addPostPageCleanup);
  addHeadingLinks();
  attachCopyButtons();
  initActiveToc(addPostPageCleanup);
  scrollToPageStartAfterSwap();
}
