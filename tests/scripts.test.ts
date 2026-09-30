import { beforeEach, describe, expect, it, vi } from "vitest";
import BackButton from "@/components/BackButton.astro";
import BackToTopButton from "@/components/BackToTopButton.astro";
import CommandPalette from "@/components/CommandPalette.astro";
import Header from "@/components/Header.astro";
import PostFilters from "@/components/PostFilters.astro";
import PostsList from "@/components/PostsList.astro";
import SearchPage from "@/pages/search.astro";
import TagsPage from "@/pages/tags/index.astro";
import { createDom, renderComponent, settle } from "./helpers/dom";

const collections = vi.hoisted(() => ({ blog: [] as unknown[] }));

vi.mock("astro:content", () => ({
  getCollection: async (name: string) =>
    name === "blog" ? collections.blog : [],
}));

const post = (slug: string, pubDatetime: string, tags: string[]) => ({
  id: slug,
  filePath: `src/content/blog/${slug}.md`,
  data: {
    slug,
    title: `Title ${slug}`,
    description: `About ${slug}`,
    pubDatetime: new Date(pubDatetime),
    draft: false,
    tags,
  },
});

const POSTS = [
  post("rrf", "2026-09-10", ["Retrieval", "LLM Systems"]),
  post("agentic-eval", "2026-08-22", ["Evaluation", "AI Agents"]),
  post("bm25", "2025-07-15", ["Retrieval"]),
];

beforeEach(() => {
  vi.stubEnv("DEV", false);
  collections.blog = POSTS;
});

const visiblePosts = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-post-list-item]")
  ).flatMap(item => (item.hidden ? [] : [item.querySelector("a")?.pathname]));

describe("onEveryPage", () => {
  it("runs now, cleans up before each swap and reruns after it", async () => {
    createDom("https://bogao.dev/");
    vi.resetModules();
    const { onEveryPage } = await import("@/scripts/lifecycle");
    const cleanup = vi.fn();
    const setup = vi.fn(() => cleanup);

    onEveryPage(setup);
    expect(setup).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event("astro:before-swap"));
    expect(cleanup).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event("astro:after-swap"));
    expect(setup).toHaveBeenCalledTimes(2);
  });

  it("ignores a second registration of the same setup", async () => {
    createDom("https://bogao.dev/");
    vi.resetModules();
    const { onEveryPage } = await import("@/scripts/lifecycle");
    const setup = vi.fn();

    onEveryPage(setup);
    onEveryPage(setup);
    document.dispatchEvent(new Event("astro:after-swap"));

    expect(setup).toHaveBeenCalledTimes(2);
  });
});

describe("post filters", () => {
  const renderPostsPage = async (url: string) => {
    createDom(url);
    document.body.innerHTML = `<main id="main-content" data-back-label="Posts">
      ${await renderComponent(PostFilters, { posts: POSTS })}
      ${await renderComponent(PostsList, { posts: POSTS, filterable: true })}
    </main>`;
    const { setupPostFiltersPage } = await import("@/scripts/postFilters");
    return setupPostFiltersPage();
  };

  it("applies year and tag filters from the URL", async () => {
    await renderPostsPage("https://bogao.dev/posts/?tag=retrieval&year=2026");

    expect(visiblePosts()).toEqual(["/posts/rrf/"]);
    expect(document.querySelector("[data-filter-status]")?.textContent).toBe(
      "Showing 1 post."
    );
    expect(
      document
        .querySelector('[data-filter-tag="retrieval"]')
        ?.getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("drops unknown filter values from the URL", async () => {
    await renderPostsPage("https://bogao.dev/posts/?year=1999&tag=nope");

    expect(location.search).toBe("");
    expect(visiblePosts()).toHaveLength(3);
    expect(
      document
        .querySelector('[data-filter-year="all"]')
        ?.hasAttribute("data-active")
    ).toBe(true);
  });

  it("keeps filters in the URL and in the stored back link", async () => {
    await renderPostsPage("https://bogao.dev/posts/");

    document
      .querySelector<HTMLButtonElement>('[data-filter-tag="evaluation"]')
      ?.click();

    expect(location.search).toBe("?tag=evaluation");
    expect(visiblePosts()).toEqual(["/posts/agentic-eval/"]);
    expect(sessionStorage.getItem("backUrl")).toBe("/posts/?tag=evaluation");
    expect(sessionStorage.getItem("backLabel")).toBe("Posts");
  });
});

describe("back navigation", () => {
  it("points detail pages back at the last list page", async () => {
    createDom("https://bogao.dev/tags/retrieval/?page=2");
    const { setupBackNavigation } = await import("@/scripts/backNavigation");

    document.body.innerHTML = `<main id="main-content" data-back-label="Tag: Retrieval"></main>`;
    setupBackNavigation();

    document.body.innerHTML = await renderComponent(BackButton, {
      href: "/posts/",
      label: "Posts",
    });
    setupBackNavigation();

    const button = document.querySelector<HTMLAnchorElement>("#back-button");
    expect(button?.getAttribute("href")).toBe("/tags/retrieval/?page=2");
    expect(button?.textContent?.trim()).toBe("Tag: Retrieval");
  });

  it("keeps the server-rendered fallback without a stored page", async () => {
    createDom("https://bogao.dev/projects/arkb/");
    const { setupBackNavigation } = await import("@/scripts/backNavigation");

    document.body.innerHTML = await renderComponent(BackButton, {
      href: "/projects/",
      label: "Projects",
    });
    setupBackNavigation();

    const button = document.querySelector<HTMLAnchorElement>("#back-button");
    expect(button?.getAttribute("href")).toBe("/projects/");
    expect(button?.textContent?.trim()).toBe("Projects");
  });
});

describe("command palette", () => {
  const records = [
    {
      title: "Gradient <Descent>",
      description: "Optimization",
      url: "/posts/gradient",
      kind: "Post",
      metaText: "machine learning",
      content: "calculus gradient descent article",
    },
    {
      title: "Retrieval notes",
      description: "BM25",
      url: "/projects/notes",
      kind: "Project",
      metaText: "",
      content: "",
    },
  ];

  it("opens with Cmd+K, searches, closes with Escape and cleans up", async () => {
    // Below 64rem the palette closes without the collapse animation.
    createDom("https://bogao.dev/", { width: 800 });
    const fetch = vi.fn(async () => ({ ok: true, json: async () => records }));
    vi.stubGlobal("fetch", fetch);
    vi.resetModules();
    const { setupCommandPalettePage } =
      await import("@/scripts/commandPalette");

    document.body.innerHTML = `<a href="/search" data-command-open>Search</a>
      ${await renderComponent(CommandPalette)}`;
    const cleanup = setupCommandPalettePage();
    const root = document.querySelector<HTMLElement>("#command-palette")!;
    const input = document.querySelector<HTMLInputElement>(
      "#command-palette-input"
    )!;

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
    expect(root.hidden).toBe(false);

    input.value = "gradient";
    input.dispatchEvent(new Event("input"));
    await settle();

    const results = document.querySelectorAll(".command-palette__result a");
    expect(Array.from(results, link => link.getAttribute("href"))).toEqual([
      "/posts/gradient",
    ]);
    expect(results[0].textContent).toContain("Gradient <Descent>");
    expect(document.querySelector("#command-palette-status")?.textContent).toBe(
      "1 result for gradient"
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(root.hidden).toBe(true);
    expect(input.value).toBe("");

    cleanup?.();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
    expect(root.hidden).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("search page", () => {
  it("searches from the URL and keeps the kind filter in it", async () => {
    createDom("https://bogao.dev/search/?q=retrieval&type=projects");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          {
            title: "Retrieval post",
            description: "",
            url: "/posts/r",
            kind: "Post",
            metaText: "",
            content: "retrieval",
          },
          {
            title: "Retrieval project",
            description: "",
            url: "/projects/r",
            kind: "Project",
            metaText: "",
            content: "retrieval",
          },
        ],
      }))
    );
    vi.resetModules();
    const { setupSearchPage } = await import("@/scripts/searchPage");

    document.documentElement.innerHTML = await renderComponent(SearchPage);
    setupSearchPage();
    await settle();

    const resultUrls = () =>
      Array.from(document.querySelectorAll("#search-results a"), link =>
        link.getAttribute("href")
      );
    expect(
      document.querySelector<HTMLInputElement>("#search-input")?.value
    ).toBe("retrieval");
    expect(resultUrls()).toEqual(["/projects/r"]);

    document
      .querySelector<HTMLButtonElement>('[data-search-kind="all"]')
      ?.click();
    await settle();
    expect(location.search).toBe("?q=retrieval");
    expect(resultUrls()).toEqual(["/posts/r", "/projects/r"]);

    document.querySelector<HTMLButtonElement>("#search-clear")?.click();
    expect(location.search).toBe("");
    expect(resultUrls()).toEqual([]);
  });
});

describe("tags index", () => {
  it("sorts topics by popularity or name", async () => {
    const window = createDom("https://bogao.dev/tags/");
    // Skip the FLIP animation, which happy-dom does not implement.
    vi.spyOn(window, "matchMedia").mockImplementation(
      query =>
        ({
          matches: query.includes("reduce"),
        }) as never
    );
    const { setupTagsIndexPage } = await import("@/scripts/tagsIndex");

    document.documentElement.innerHTML = await renderComponent(TagsPage);
    setupTagsIndexPage();

    const tagNames = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-tag-card]"),
        card => card.dataset.tagName
      );
    expect(tagNames()[0]).toBe("Retrieval");

    document.querySelector<HTMLButtonElement>('[data-tag-sort="az"]')?.click();
    expect(tagNames()).toEqual([
      "AI Agents",
      "Evaluation",
      "LLM Systems",
      "Retrieval",
    ]);
    expect(document.querySelector("[data-tags-status]")?.textContent).toBe(
      "Showing all 4 topics, sorted A-Z."
    );
  });
});

describe("header", () => {
  it("toggles the mobile menu", async () => {
    createDom("https://bogao.dev/");
    const { setupHeaderNav } = await import("@/scripts/headerNav");

    document.body.innerHTML = await renderComponent(Header);
    setupHeaderNav();

    const button = document.querySelector<HTMLButtonElement>("#menu-btn")!;
    const menu = document.querySelector<HTMLElement>("#menu-items")!;
    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(menu.classList.contains("hidden")).toBe(false);
    button.click();
    expect(menu.classList.contains("hidden")).toBe(true);
  });
});

describe("back to top", () => {
  it("shows after 30% of the page and stops listening on cleanup", async () => {
    createDom("https://bogao.dev/posts/rrf/");
    const { setupBackToTopButton } = await import("@/scripts/backToTop");

    document.body.innerHTML = await renderComponent(BackToTopButton);
    const root = document.documentElement;
    Object.defineProperty(root, "scrollHeight", { value: 2000 });
    Object.defineProperty(root, "clientHeight", { value: 1000 });
    const container = document.querySelector("#btt-btn-container")!;
    const cleanup = setupBackToTopButton();

    root.scrollTop = 500;
    document.dispatchEvent(new Event("scroll"));
    await settle();
    expect(container.classList.contains("opacity-100")).toBe(true);

    cleanup?.();
    root.scrollTop = 0;
    document.dispatchEvent(new Event("scroll"));
    await settle();
    expect(container.classList.contains("opacity-100")).toBe(true);
  });
});

describe("post details", () => {
  const ARTICLE = `
    <nav><a href="#first" data-toc-link>First</a><a href="#second" data-toc-link>Second</a></nav>
    <article id="article">
      <h2 id="first">First</h2>
      <pre><code>npm run build</code></pre>
      <h2 id="second">Second</h2>
    </article>`;

  it("adds anchors, copy buttons, progress and TOC state once per page", async () => {
    createDom("https://bogao.dev/posts/rrf/");
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { setupPostDetailsPage } = await import("@/scripts/postDetails");

    document.body.innerHTML = ARTICLE;
    // happy-dom has no layout: give the page some length and put the second
    // heading below the fold.
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 5000,
    });
    document.querySelector("#second")!.getBoundingClientRect = () =>
      ({ top: 900 }) as DOMRect;
    const cleanup = setupPostDetailsPage();

    expect(document.querySelectorAll(".heading-link")).toHaveLength(2);
    expect(document.querySelectorAll(".progress-container")).toHaveLength(1);
    expect(document.querySelector('[data-toc-link][aria-current="true"]')).toBe(
      document.querySelector('[data-toc-link][href="#first"]')
    );

    const copyButton = document.querySelector<HTMLButtonElement>(".copy-code")!;
    copyButton.click();
    await settle();
    expect(writeText).toHaveBeenCalledWith("npm run build");
    expect(copyButton.textContent).toBe("Copied");

    cleanup?.();
    expect(document.querySelector(".progress-container")).toBeNull();
  });

  it("falls back to execCommand when the Clipboard API is blocked", async () => {
    createDom("https://bogao.dev/posts/rrf/");
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn(async () => Promise.reject(new Error())) },
    });
    const execCommand = vi.fn(() => true);
    document.execCommand = execCommand;
    const { copyText } = await import("@/scripts/clipboard");

    await expect(copyText("hello")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });
});
