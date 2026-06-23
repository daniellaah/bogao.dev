import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const MODULE_TEST_CACHE_DIR = path.join(
  os.tmpdir(),
  "daniellaah-tech-blog",
  "maintainability-tests"
);

const readText = relativePath =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = relativePath => JSON.parse(readText(relativePath));

const parseFrontmatter = relativePath =>
  readText(relativePath).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";

const getFrontmatterField = (frontmatter, field) =>
  frontmatter
    .match(new RegExp(`^${field}:\\s*["']?([^"'\n]+)["']?`, "m"))?.[1]
    ?.trim();

const listMarkdownFiles = dir =>
  fs
    .readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .flatMap(entry => {
      const relativePath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(relativePath);
      return /\.(md|mdx)$/i.test(entry.name) ? [relativePath] : [];
    });

const stripMarkdownExt = value => value.replace(/\.(md|mdx)$/i, "");

const loadTypeScriptModule = async relativePath => {
  const source = readText(relativePath);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(outputText)}`
  );
};

const loadProjectModule = async (entryPath, modulePaths) => {
  fs.mkdirSync(MODULE_TEST_CACHE_DIR, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(MODULE_TEST_CACHE_DIR, "modules-"));
  fs.symlinkSync(
    path.join(ROOT, "node_modules"),
    path.join(tempDir, "node_modules"),
    "dir"
  );

  try {
    for (const modulePath of modulePaths) {
      const source = readText(modulePath);

      const { outputText } = modulePath.endsWith(".ts")
        ? ts.transpileModule(source, {
            compilerOptions: {
              module: ts.ModuleKind.ES2022,
              target: ts.ScriptTarget.ES2022,
            },
          })
        : { outputText: source };
      const withResolvableImports = outputText.replace(
        /(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
        (_match, prefix, specifier, suffix) => {
          const resolvedSpecifier = /\.(mjs|js|ts)$/.test(specifier)
            ? specifier.replace(/\.(mjs|js|ts)$/, ".mjs")
            : `${specifier}.mjs`;
          return `${prefix}${resolvedSpecifier}${suffix}`;
        }
      );
      const outputFile = path.join(
        tempDir,
        modulePath.replace(/\.(ts|js|mjs)$/, ".mjs")
      );
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, withResolvableImports);
    }

    return await import(
      pathToFileURL(
        path.join(tempDir, entryPath.replace(/\.(ts|js|mjs)$/, ".mjs"))
      ).href
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const loadSearchIndexInternals = async () => {
  const source = readText("src/pages/search-index.json.ts")
    .replace(/^import .*$/gm, "")
    .replace(
      /const SEARCH_RECORD_KINDS =[\s\S]*?const stripMarkdown/,
      "const stripMarkdown"
    )
    .replace(/export const GET:[\s\S]*$/m, "export { stripMarkdown };");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(outputText)}`
  );
};

const makeTestClassList = initial => {
  const classes = new Set(initial);
  return {
    contains: name => classes.has(name),
    toggle: (name, active) => {
      if (active === undefined) {
        if (classes.has(name)) classes.delete(name);
        else classes.add(name);
      } else if (active) classes.add(name);
      else classes.delete(name);
    },
  };
};

const makeEventElement = ({ classNames = [] } = {}) => {
  const attributes = new Map();
  const handlers = new Map();
  return {
    classList: makeTestClassList(classNames),
    dataset: {},
    addEventListener: (event, handler) => {
      const eventHandlers = handlers.get(event) ?? new Set();
      eventHandlers.add(handler);
      handlers.set(event, eventHandlers);
    },
    removeEventListener: (event, handler) => {
      handlers.get(event)?.delete(handler);
    },
    dispatch: event => {
      for (const handler of handlers.get(event) ?? []) handler();
    },
    handlerCount: event => handlers.get(event)?.size ?? 0,
    getAttribute: name => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
};

const makeMetricButton = (dataset, metrics) => {
  const attributes = new Map();
  let clickHandler = () => {};
  return {
    dataset,
    offsetLeft: metrics.left,
    offsetTop: metrics.top,
    offsetWidth: metrics.width,
    offsetHeight: metrics.height,
    addEventListener: (event, handler) => {
      if (event === "click") clickHandler = handler;
    },
    click: () => clickHandler(),
    toggleAttribute: (name, active) => {
      if (active) attributes.set(name, "");
      else attributes.delete(name);
    },
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: name => attributes.get(name),
    hasAttribute: name => attributes.has(name),
  };
};

test("breadcrumb handles indexed routes", async () => {
  const { getBreadcrumbList } = await loadTypeScriptModule(
    "src/utils/breadcrumb.ts"
  );

  assert.deepEqual(getBreadcrumbList("/posts/"), ["Posts (page 1)"]);
  assert.deepEqual(getBreadcrumbList("/posts/2/"), ["Posts (page 2)"]);
  assert.deepEqual(getBreadcrumbList("/tags/machine-learning/2/"), [
    "tags",
    "machine-learning (page 2)",
  ]);
});

test("content URL helpers preserve public route contracts", async () => {
  const modulePaths = [
    "src/utils/slugifyCore.js",
    "src/utils/slugify.ts",
    "src/utils/contentSlug.ts",
    "src/utils/getPath.ts",
    "src/utils/getPostPath.ts",
    "src/utils/getNotePath.ts",
    "src/utils/getProjectPath.ts",
  ];
  const { getPostPath } = await loadProjectModule(
    "src/utils/getPostPath.ts",
    modulePaths
  );
  const { getNotePath } = await loadProjectModule(
    "src/utils/getNotePath.ts",
    modulePaths
  );
  const { getProjectPath } = await loadProjectModule(
    "src/utils/getProjectPath.ts",
    modulePaths
  );

  const post = {
    id: "ignored-fallback.md",
    filePath: "src/content/blog/ML Notes/Example Post.md",
    slug: "collection-slug",
    data: { slug: "Stable Custom Slug.md" },
  };
  const collectionSlugPost = {
    ...post,
    data: {},
  };

  assert.equal(getPostPath(post), "/posts/ml-notes/stable-custom-slug");
  assert.equal(getPostPath(post, false), "ml-notes/stable-custom-slug");
  assert.equal(
    getPostPath(collectionSlugPost),
    "/posts/ml-notes/collection-slug"
  );
  assert.equal(
    getNotePath("2026-03-07-la-5k-morning.md", "Race Day.md"),
    "/notes/race-day"
  );
  assert.equal(getProjectPath("BoGaoDev.md"), "/projects/bogaodev");
});

test("content path helpers keep low-level stripping private", () => {
  const contentSlug = readText("src/utils/contentSlug.ts");
  const getPath = readText("src/utils/getPath.ts");

  assert.ok(contentSlug.includes("export const getPathSegmentSlug"));
  assert.ok(!contentSlug.includes("export const stripMarkdownExt"));
  assert.ok(getPath.includes("getPathSegmentSlug(segment)"));
  assert.ok(!getPath.includes("@/content.config"));
});

test("post detail routes use standard post paths", () => {
  const route = readText("src/pages/posts/[...slug]/index.astro");
  const postPathHelper = readText("src/utils/getPostPath.ts");
  const postRouteEntries = fs
    .readdirSync(path.join(ROOT, "src/pages/posts"))
    .sort();

  assert.ok(route.includes("getSortedPosts"));
  assert.ok(route.includes("getPostPath(post, false)"));
  assert.ok(postPathHelper.includes("post.data.slug ?? post.slug"));
  assert.ok(postPathHelper.includes('path.replace(/^\\/+/, "")'));
  assert.deepEqual(postRouteEntries, ["[...page].astro", "[...slug]"]);
});

test("search kind contract stays explicit and shared", () => {
  const searchKinds = readJson("src/data/search-kinds.json");
  const searchEndpoint = readText("src/pages/search-index.json.ts");
  const searchPage = readText("src/pages/search.astro");
  const searchUtils = readText("src/utils/search.ts");
  const searchPageScript = readText("src/scripts/searchPage.ts");

  assert.deepEqual(
    searchKinds.map(kind => kind.filter),
    ["all", "posts", "notes", "projects", "tags"]
  );
  assert.deepEqual(
    searchKinds.map(kind => kind.recordKind),
    [null, "Post", "Note", "Project", "Tag"]
  );
  assert.equal(new Set(searchKinds.map(kind => kind.filter)).size, 5);
  assert.ok(searchEndpoint.includes("getPostPath(post)"));
  assert.ok(searchPage.includes('from "@/scripts/searchPage"'));
  assert.ok(
    searchPageScript.includes("rankSearchRecords(visibleRecords, terms)")
  );
  assert.ok(searchUtils.includes("`${record.kind}:${record.url}`"));
});

test("search index content strips markdown-only markup", async () => {
  const { stripMarkdown } = await loadSearchIndexInternals();

  assert.equal(
    stripMarkdown(
      [
        "# Heading",
        "Visible [link text](/posts/example) and ![image alt](/image.png).",
        "`inline code` and $x + y$",
        "```js",
        "console.log('hidden')",
        "```",
        "<strong>html text</strong>",
      ].join("\n")
    ),
    "Heading Visible link text and . and html text"
  );
});

test("search UI helpers share ranking and query parsing rules", async () => {
  const {
    createSearchIndexLoader,
    escapeSearchHtml,
    rankSearchRecords,
    scoreSearchRecord,
    splitSearchTerms,
  } = await loadTypeScriptModule("src/utils/search.ts");
  const searchPage = readText("src/pages/search.astro");
  const searchPageScript = readText("src/scripts/searchPage.ts");
  const commandPalette = readText("src/components/CommandPalette.astro");
  const commandPaletteScript = readText("src/scripts/commandPalette.ts");

  assert.deepEqual(splitSearchTerms(" Machine   Learning "), [
    "machine",
    "learning",
  ]);
  assert.deepEqual(splitSearchTerms("机器学习"), ["机器学习"]);
  assert.equal(escapeSearchHtml("<tag>&\"'"), "&lt;tag&gt;&amp;&quot;&#39;");
  assert.equal(
    scoreSearchRecord(
      {
        title: "Gradient descent",
        description: "Optimization",
        url: "/posts/example",
        kind: "Post",
        metaText: "machine learning",
        content: "calculus notes",
      },
      ["machine", "learning"]
    )?.score,
    10
  );
  assert.equal(
    scoreSearchRecord(
      {
        title: "Gradient descent",
        description: "Optimization",
        url: "/posts/example",
        kind: "Post",
        metaText: "machine learning",
        content: "calculus notes",
      },
      ["missing"]
    ),
    null
  );
  assert.deepEqual(
    rankSearchRecords(
      [
        {
          title: "Gradient descent",
          description: "Optimization",
          url: "/posts/example",
          kind: "Post",
          metaText: "machine learning",
          content: "calculus notes",
        },
        {
          title: "Gradient descent duplicate",
          description: "Optimization",
          url: "/posts/example",
          kind: "Post",
          metaText: "",
          content: "machine learning",
        },
      ],
      ["machine", "learning"]
    ).map(record => record.title),
    ["Gradient descent"]
  );
  {
    let calls = 0;
    const loadSearchIndex = createSearchIndexLoader(async () => {
      calls += 1;
      if (calls === 1) {
        return { ok: false, json: async () => [] };
      }
      return {
        ok: true,
        json: async () => [
          {
            title: "Retry works",
            description: "",
            url: "/posts/retry",
            kind: "Post",
            metaText: "",
            content: "",
          },
        ],
      };
    });

    await assert.rejects(loadSearchIndex, /Search index request failed/);
    assert.equal((await loadSearchIndex())[0].title, "Retry works");
    assert.equal(calls, 2);
  }
  assert.ok(searchPage.includes('from "@/scripts/searchPage"'));
  assert.ok(searchPageScript.includes('from "../utils/search"'));
  assert.ok(commandPalette.includes('from "@/scripts/commandPalette"'));
  assert.ok(commandPaletteScript.includes('from "../utils/search"'));
});

test("tag aggregation keeps post and note counts in one shared helper", async () => {
  const { collectTagStats } = await loadProjectModule("src/utils/tags.ts", [
    "src/utils/slugifyCore.js",
    "src/utils/slugify.ts",
    "src/utils/tags.ts",
  ]);

  const stats = collectTagStats([
    { kind: "post", tags: ["Machine Learning", "Machine Learning", "LLMs"] },
    { kind: "note", tags: ["machine learning", "Running"] },
    { kind: "post", tags: ["Draft"], draft: true },
  ]).sort((a, b) => a.slug.localeCompare(b.slug));

  assert.deepEqual(
    stats.map(({ slug, totalCount, postCount, noteCount }) => ({
      slug,
      totalCount,
      postCount,
      noteCount,
    })),
    [
      { slug: "llms", totalCount: 1, postCount: 1, noteCount: 0 },
      { slug: "machine-learning", totalCount: 2, postCount: 1, noteCount: 1 },
      { slug: "running", totalCount: 1, postCount: 0, noteCount: 1 },
    ]
  );
});

test("shared dayjs utility preserves UTC content date formatting", async () => {
  const { default: dayjs } = await loadProjectModule("src/utils/dayjs.ts", [
    "src/utils/dayjs.ts",
  ]);

  assert.equal(
    dayjs.utc("2026-03-07T00:30:00-08:00").format("YYYY-MM-DD"),
    "2026-03-07"
  );
  assert.equal(
    dayjs.utc("2026-03-07T00:30:00-08:00").format("D MMM YYYY"),
    "7 Mar 2026"
  );
});

test("toggle controls update active state and indicator geometry", async () => {
  const { setActiveToggleButton } = await loadTypeScriptModule(
    "src/scripts/toggleControls.ts"
  );
  const indicatorStyles = new Map();
  const toggle = {
    style: {
      setProperty: (name, value) => indicatorStyles.set(name, value),
    },
  };
  const popularButton = makeMetricButton(
    { tagSort: "popular" },
    {
      left: 0,
      top: 0,
      width: 48,
      height: 32,
    }
  );
  const azButton = makeMetricButton(
    { tagSort: "az" },
    {
      left: 56,
      top: 4,
      width: 36,
      height: 28,
    }
  );

  setActiveToggleButton([popularButton, azButton], "tagSort", "az", toggle);

  assert.equal(popularButton.hasAttribute("data-active"), false);
  assert.equal(popularButton.getAttribute("aria-pressed"), "false");
  assert.equal(azButton.hasAttribute("data-active"), true);
  assert.equal(azButton.getAttribute("aria-pressed"), "true");
  assert.equal(indicatorStyles.get("--sort-indicator-x"), "56px");
  assert.equal(indicatorStyles.get("--sort-indicator-y"), "4px");
  assert.equal(indicatorStyles.get("--sort-indicator-width"), "36px");
  assert.equal(indicatorStyles.get("--sort-indicator-height"), "28px");
});

test("home page client script preserves back link and avatar replay behavior", async () => {
  const { setupHomePage } = await loadProjectModule("src/scripts/homePage.ts", [
    "src/scripts/homePage.ts",
  ]);
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalSessionStorage = globalThis.sessionStorage;
  const originalPerformance = globalThis.performance;
  const originalDateNow = Date.now;
  const storage = new Map();
  let currentNow = 1000;
  let currentDateNow = 1700000000000;
  const makeImage = src => ({
    dataset: {},
    src,
    getAttribute: name => (name === "src" ? src : null),
  });
  const avatar = {
    handlers: new Map(),
    addEventListener(event, handler) {
      const handlers = this.handlers.get(event) ?? new Set();
      handlers.add(handler);
      this.handlers.set(event, handlers);
    },
    removeEventListener(event, handler) {
      this.handlers.get(event)?.delete(handler);
    },
    dispatch(event) {
      for (const handler of this.handlers.get(event) ?? []) handler();
    },
    handlerCount(event) {
      return this.handlers.get(event)?.size ?? 0;
    },
  };
  const lightAvatar = makeImage("/images/site/avatar.svg");
  const darkAvatar = makeImage("/images/site/avatar-dark.svg?old=1");
  const mainContent = { dataset: { layout: "index" } };
  const homeWindow = {};

  Date.now = () => currentDateNow;
  globalThis.window = homeWindow;
  globalThis.sessionStorage = {
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.performance = { now: () => currentNow };
  globalThis.document = {
    querySelector: selector =>
      ({
        "#main-content": mainContent,
        ".hero-avatar": avatar,
      })[selector] ?? null,
    querySelectorAll: selector =>
      selector === ".hero-avatar__image" ? [lightAvatar, darkAvatar] : [],
  };

  try {
    setupHomePage();

    assert.equal(storage.get("backUrl"), "/");
    assert.equal(lightAvatar.dataset.avatarSrc, "/images/site/avatar.svg");
    assert.equal(darkAvatar.dataset.avatarSrc, "/images/site/avatar-dark.svg");
    assert.equal(
      lightAvatar.src,
      "/images/site/avatar.svg?replay=1700000000000-1000-0"
    );
    assert.equal(
      darkAvatar.src,
      "/images/site/avatar-dark.svg?replay=1700000000000-1000-1"
    );
    assert.equal(avatar.handlerCount("pointerenter"), 1);

    currentNow = 1100;
    currentDateNow = 1700000000100;
    avatar.dispatch("pointerenter");

    assert.equal(
      lightAvatar.src,
      "/images/site/avatar.svg?replay=1700000000000-1000-0"
    );

    currentNow = 1401;
    currentDateNow = 1700000000401;
    avatar.dispatch("pointerenter");

    assert.equal(
      lightAvatar.src,
      "/images/site/avatar.svg?replay=1700000000401-1401-0"
    );

    setupHomePage();

    assert.equal(avatar.handlerCount("pointerenter"), 1);

    homeWindow.__homeAvatarHoverCleanup();

    assert.equal(avatar.handlerCount("pointerenter"), 0);
  } finally {
    Date.now = originalDateNow;
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.sessionStorage = originalSessionStorage;
    globalThis.performance = originalPerformance;
  }
});

test("back navigation client script preserves stored back link behavior", async () => {
  const { storeBackUrl, updateBackButtonUrl } = await loadProjectModule(
    "src/scripts/backNavigation.ts",
    ["src/scripts/backNavigation.ts"]
  );
  const originalDocument = globalThis.document;
  const originalSessionStorage = globalThis.sessionStorage;
  const storage = new Map();
  const backButton = { href: "/" };
  let mainContent = { dataset: { backurl: "/posts/example/" } };
  globalThis.sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.document = {
    querySelector: selector =>
      ({
        "#main-content": mainContent,
        "#back-button": backButton,
      })[selector] ?? null,
  };

  try {
    storeBackUrl();

    assert.equal(storage.get("backUrl"), "/posts/example/");

    updateBackButtonUrl();

    assert.equal(backButton.href, "/posts/example/");

    mainContent = { dataset: {} };
    storage.clear();
    backButton.href = "/";

    storeBackUrl();
    updateBackButtonUrl();

    assert.equal(storage.has("backUrl"), false);
    assert.equal(backButton.href, "/");
  } finally {
    globalThis.document = originalDocument;
    globalThis.sessionStorage = originalSessionStorage;
  }
});

test("header nav client script preserves menu toggle behavior", async () => {
  const { setupHeaderNav } = await loadProjectModule(
    "src/scripts/headerNav.ts",
    ["src/scripts/headerNav.ts"]
  );
  const originalDocument = globalThis.document;
  const menuBtn = makeEventElement();
  const menuItems = makeEventElement({ classNames: ["hidden"] });
  const menuIcon = makeEventElement();
  const closeIcon = makeEventElement({ classNames: ["hidden"] });
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open Menu");
  globalThis.document = {
    querySelector: selector =>
      ({
        "#menu-btn": menuBtn,
        "#menu-items": menuItems,
        "#menu-icon": menuIcon,
        "#close-icon": closeIcon,
      })[selector] ?? null,
  };

  try {
    setupHeaderNav();

    assert.equal(menuBtn.dataset.navBound, "true");
    assert.equal(menuBtn.handlerCount("click"), 1);

    menuBtn.dispatch("click");

    assert.equal(menuBtn.getAttribute("aria-expanded"), "true");
    assert.equal(menuBtn.getAttribute("aria-label"), "Close Menu");
    assert.equal(menuItems.classList.contains("hidden"), false);
    assert.equal(menuIcon.classList.contains("hidden"), true);
    assert.equal(closeIcon.classList.contains("hidden"), false);

    setupHeaderNav();

    assert.equal(menuBtn.handlerCount("click"), 1);

    menuBtn.dispatch("click");

    assert.equal(menuBtn.getAttribute("aria-expanded"), "false");
    assert.equal(menuBtn.getAttribute("aria-label"), "Open Menu");
    assert.equal(menuItems.classList.contains("hidden"), true);
    assert.equal(menuIcon.classList.contains("hidden"), false);
    assert.equal(closeIcon.classList.contains("hidden"), true);
  } finally {
    globalThis.document = originalDocument;
  }
});

test("back-to-top client script preserves scroll and cleanup behavior", async () => {
  const { setupBackToTopButton } = await loadProjectModule(
    "src/scripts/backToTop.ts",
    ["src/scripts/backToTop.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const documentHandlers = new Map();
  const addDocumentHandler = (event, handler) => {
    const handlers = documentHandlers.get(event) ?? new Set();
    handlers.add(handler);
    documentHandlers.set(event, handlers);
  };
  const removeDocumentHandler = (event, handler) => {
    documentHandlers.get(event)?.delete(handler);
  };
  const dispatchDocument = event => {
    for (const handler of documentHandlers.get(event) ?? []) handler();
  };
  const documentHandlerCount = event => documentHandlers.get(event)?.size ?? 0;
  const rootElement = {
    clientHeight: 500,
    scrollHeight: 1000,
    scrollTop: 0,
  };
  const body = { scrollTop: 0 };
  const btnContainer = makeEventElement({
    classNames: ["opacity-0", "translate-y-14"],
  });
  const backToTopBtn = makeEventElement();
  const animationFrameCallbacks = [];
  const windowMock = {
    requestAnimationFrame: callback => {
      animationFrameCallbacks.push(callback);
      return 1;
    },
  };
  const flushAnimationFrame = () => animationFrameCallbacks.shift()?.();

  globalThis.window = windowMock;
  globalThis.document = {
    body,
    documentElement: rootElement,
    addEventListener: addDocumentHandler,
    removeEventListener: removeDocumentHandler,
    querySelector: selector =>
      ({
        "#btt-btn-container": btnContainer,
        "[data-button='back-to-top']": backToTopBtn,
      })[selector] ?? null,
  };

  try {
    setupBackToTopButton();

    assert.equal(backToTopBtn.dataset.backToTopBound, "true");
    assert.equal(backToTopBtn.handlerCount("click"), 1);
    assert.equal(documentHandlerCount("scroll"), 1);
    assert.equal(documentHandlerCount("astro:before-swap"), 1);

    rootElement.scrollTop = 200;
    dispatchDocument("scroll");
    flushAnimationFrame();

    assert.equal(btnContainer.classList.contains("opacity-100"), true);
    assert.equal(btnContainer.classList.contains("translate-y-0"), true);
    assert.equal(btnContainer.classList.contains("opacity-0"), false);
    assert.equal(btnContainer.classList.contains("translate-y-14"), false);

    rootElement.scrollTop = 100;
    dispatchDocument("scroll");
    flushAnimationFrame();

    assert.equal(btnContainer.classList.contains("opacity-100"), false);
    assert.equal(btnContainer.classList.contains("translate-y-0"), false);
    assert.equal(btnContainer.classList.contains("opacity-0"), true);
    assert.equal(btnContainer.classList.contains("translate-y-14"), true);

    rootElement.scrollTop = 320;
    body.scrollTop = 240;
    backToTopBtn.dispatch("click");

    assert.equal(rootElement.scrollTop, 0);
    assert.equal(body.scrollTop, 0);

    setupBackToTopButton();

    assert.equal(backToTopBtn.handlerCount("click"), 1);
    assert.equal(documentHandlerCount("scroll"), 1);

    windowMock.__backToTopCleanup();

    assert.equal(backToTopBtn.handlerCount("click"), 0);
    assert.equal(documentHandlerCount("scroll"), 0);
    assert.equal(documentHandlerCount("astro:before-swap"), 0);
    assert.equal(backToTopBtn.dataset.backToTopBound, undefined);
    assert.equal(windowMock.__backToTopCleanup, undefined);
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  }
});

test("tags index client script preserves sort state behavior", async () => {
  const { setupTagsIndexPage } = await loadProjectModule(
    "src/scripts/tagsIndex.ts",
    ["src/scripts/toggleControls.ts", "src/scripts/tagsIndex.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const appendedCards = [];
  const indicatorStyles = new Map();
  const popularButton = makeMetricButton(
    { tagSort: "popular" },
    {
      left: 0,
      top: 0,
      width: 48,
      height: 32,
    }
  );
  const azButton = makeMetricButton(
    { tagSort: "az" },
    {
      left: 56,
      top: 4,
      width: 36,
      height: 28,
    }
  );
  const status = { textContent: "" };
  const sortToggle = {
    dataset: {},
    style: {
      setProperty: (name, value) => indicatorStyles.set(name, value),
    },
  };
  const cardGrid = {
    append: card => appendedCards.push(card.dataset.tagName),
  };
  const cards = [
    {
      dataset: { tagName: "Beta", totalCount: "3" },
      getAnimations: () => [],
    },
    {
      dataset: { tagName: "Alpha", totalCount: "1" },
      getAnimations: () => [],
    },
  ];
  const root = {
    dataset: {},
    removeAttribute: name => delete root.dataset[name],
    querySelector: selector =>
      ({
        "[data-tags-status]": status,
        "[data-tags-sort-toggle]": sortToggle,
        "[data-tags-card-grid]": cardGrid,
      })[selector] ?? null,
    querySelectorAll: selector =>
      ({
        "[data-tag-sort]": [popularButton, azButton],
        "[data-tag-card]": cards,
      })[selector] ?? [],
  };

  globalThis.window = {
    matchMedia: () => ({ matches: true }),
    requestAnimationFrame: callback => {
      callback();
      return 1;
    },
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  globalThis.document = {
    querySelector: selector => (selector === "[data-tags-index]" ? root : null),
  };

  try {
    setupTagsIndexPage();
    assert.equal(
      status.textContent,
      "Showing all 2 topics, sorted by popularity."
    );
    assert.equal(popularButton.getAttribute("aria-pressed"), "true");
    assert.equal(azButton.getAttribute("aria-pressed"), "false");
    assert.equal(sortToggle.dataset.inkReady, "true");

    azButton.click();

    assert.deepEqual(appendedCards, ["Alpha", "Beta"]);
    assert.equal(status.textContent, "Showing all 2 topics, sorted A-Z.");
    assert.equal(popularButton.getAttribute("aria-pressed"), "false");
    assert.equal(azButton.getAttribute("aria-pressed"), "true");
    assert.equal(indicatorStyles.get("--sort-indicator-x"), "56px");
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  }
});

test("post filters client script preserves URL-backed filtering", async () => {
  const { setupPostFiltersPage } = await loadProjectModule(
    "src/scripts/postFilters.ts",
    ["src/scripts/toggleControls.ts", "src/scripts/postFilters.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalHistory = globalThis.history;
  const indicatorStyles = new Map();
  const yearAll = makeMetricButton(
    { filterYear: "all" },
    {
      left: 0,
      top: 0,
      width: 44,
      height: 32,
    }
  );
  const year2024 = makeMetricButton(
    { filterYear: "2024" },
    {
      left: 52,
      top: 0,
      width: 56,
      height: 32,
    }
  );
  const tagAll = makeMetricButton(
    { filterTag: "all" },
    {
      left: 0,
      top: 0,
      width: 44,
      height: 32,
    }
  );
  const tagNotes = makeMetricButton(
    { filterTag: "notes" },
    {
      left: 52,
      top: 0,
      width: 64,
      height: 32,
    }
  );
  const postA = {
    dataset: { postYear: "2024", postTags: "ml ai" },
    hidden: false,
  };
  const postB = {
    dataset: { postYear: "2023", postTags: "notes" },
    hidden: false,
  };
  const status = { textContent: "" };
  const makeToggle = () => {
    const attributes = new Map();
    return {
      style: {
        setProperty: (name, value) => indicatorStyles.set(name, value),
      },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name),
    };
  };
  const yearToggle = makeToggle();
  const tagToggle = makeToggle();
  const root = {
    dataset: {},
    querySelector: selector =>
      ({
        "[data-filter-status]": status,
        '[data-filter-toggle="year"]': yearToggle,
        '[data-filter-toggle="tag"]': tagToggle,
      })[selector] ?? null,
    querySelectorAll: selector =>
      ({
        "[data-filter-year]": [yearAll, year2024],
        "[data-filter-tag]": [tagAll, tagNotes],
      })[selector] ?? [],
  };
  const location = {
    pathname: "/posts",
    search: "?year=2024&tag=missing",
  };
  const history = {
    state: { from: "test" },
    replacedWith: "",
    replaceState: (_state, _title, url) => {
      history.replacedWith = url;
      const [pathname, search = ""] = url.split("?");
      location.pathname = pathname;
      location.search = search ? `?${search}` : "";
    },
  };

  globalThis.window = {
    location,
    requestAnimationFrame: callback => {
      callback();
      return 1;
    },
    cancelAnimationFrame: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  globalThis.document = {
    querySelector: selector =>
      selector === "[data-post-filters]" ? root : null,
    querySelectorAll: selector =>
      selector === "[data-post-list-item]" ? [postA, postB] : [],
  };
  globalThis.history = history;

  try {
    setupPostFiltersPage();

    assert.equal(history.replacedWith, "/posts?year=2024");
    assert.equal(postA.hidden, false);
    assert.equal(postB.hidden, true);
    assert.equal(status.textContent, "Showing 1 post.");
    assert.equal(year2024.getAttribute("aria-pressed"), "true");
    assert.equal(tagAll.getAttribute("aria-pressed"), "true");
    assert.equal(yearToggle.getAttribute("data-ink-ready"), "true");

    tagNotes.click();

    assert.equal(history.replacedWith, "/posts?year=2024&tag=notes");
    assert.equal(postA.hidden, true);
    assert.equal(postB.hidden, true);
    assert.equal(status.textContent, "Showing 0 posts.");
    assert.equal(tagNotes.getAttribute("aria-pressed"), "true");
    assert.equal(indicatorStyles.get("--sort-indicator-x"), "52px");
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.history = originalHistory;
  }
});

test("command palette client script opens, searches, and closes", async () => {
  const { setupCommandPalettePage } = await loadProjectModule(
    "src/scripts/commandPalette.ts",
    ["src/utils/search.ts", "src/scripts/commandPalette.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;
  const originalHTMLElement = globalThis.HTMLElement;
  const makeClassList = initial => {
    const classes = new Set(initial);
    return {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle: (name, active) => {
        if (active) classes.add(name);
        else classes.delete(name);
      },
    };
  };

  class MockElement {
    constructor({ classNames = [], dataset = {}, rect = {} } = {}) {
      this.attributes = new Map();
      this.classList = makeClassList(classNames);
      this.dataset = dataset;
      this.eventHandlers = new Map();
      this.hidden = false;
      this.innerHTML = "";
      this.offsetParent = {};
      this.style = {
        setProperty: (name, value) => this.attributes.set(name, value),
      };
      this.tabIndex = 0;
      this.value = "";
      this.rect = {
        left: 0,
        right: 120,
        top: 0,
        width: 120,
        height: 40,
        ...rect,
      };
    }

    addEventListener(event, handler) {
      this.eventHandlers.set(event, handler);
    }

    removeEventListener(event) {
      this.eventHandlers.delete(event);
    }

    dispatch(event, payload = {}) {
      this.eventHandlers.get(event)?.(payload);
    }

    setAttribute(name, value) {
      this.attributes.set(name, value);
    }

    getAttribute(name) {
      return this.attributes.get(name);
    }

    toggleAttribute(name, active) {
      if (active) this.attributes.set(name, "");
      else this.attributes.delete(name);
    }

    focus() {
      this.focused = true;
      globalThis.document.activeElement = this;
    }

    blur() {
      this.blurred = true;
    }

    getBoundingClientRect() {
      return this.rect;
    }
  }

  const root = new MockElement({ classNames: ["hidden"] });
  root.hidden = true;
  root.setAttribute("aria-hidden", "true");
  const panel = new MockElement();
  const input = new MockElement();
  const status = new MockElement();
  const results = new MockElement();
  const resultsPanel = new MockElement();
  const thinking = new MockElement();
  const closeButton = new MockElement();
  const navWrap = new MockElement({ rect: { left: 10, right: 600 } });
  const siteBrand = new MockElement({ rect: { right: 80 } });
  const firstNavItem = new MockElement({ rect: { left: 120 } });
  const searchMark = new MockElement({ rect: { width: 24 } });
  const openButton = new MockElement({
    rect: { left: 500, right: 560, top: 20, width: 60, height: 40 },
  });
  openButton.querySelector = selector =>
    selector === ".search-nav-mark" ? searchMark : null;
  const previousActiveElement = new MockElement();
  const documentHandlers = new Map();

  globalThis.HTMLElement = MockElement;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        title: "Gradient <Descent>",
        description: "Optimization",
        url: "/posts/gradient",
        kind: "Post",
        metaText: "machine learning",
        content: "",
      },
    ],
  });
  globalThis.window = {
    requestAnimationFrame: callback => {
      callback();
      return 1;
    },
    clearTimeout: () => {},
    setTimeout: callback => {
      callback();
      return 1;
    },
    matchMedia: query => ({
      matches: query === "(prefers-reduced-motion: reduce)",
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  globalThis.document = {
    activeElement: previousActiveElement,
    addEventListener: (event, handler) => documentHandlers.set(event, handler),
    removeEventListener: event => documentHandlers.delete(event),
    querySelector: selector =>
      ({
        "#command-palette": root,
        ".command-palette__panel": panel,
        "#command-palette-input": input,
        "#command-palette-status": status,
        "#command-palette-results": results,
        "#command-palette-results-panel": resultsPanel,
        "#command-palette-thinking": thinking,
        "#top-nav-wrap": navWrap,
        ".site-brand": siteBrand,
        "[data-nav-item]": firstNavItem,
        "[data-command-open]": openButton,
      })[selector] ?? null,
    querySelectorAll: selector =>
      ({
        "[data-command-close]": [closeButton],
        "[data-command-open]": [openButton],
      })[selector] ?? [],
  };

  try {
    setupCommandPalettePage();

    let openPrevented = false;
    openButton.dispatch("click", {
      preventDefault: () => {
        openPrevented = true;
      },
    });

    assert.equal(openPrevented, true);
    assert.equal(root.hidden, false);
    assert.equal(root.getAttribute("aria-hidden"), "false");
    assert.equal(openButton.attributes.has("data-command-active"), true);
    assert.equal(input.focused, true);

    input.value = "gradient";
    input.dispatch("input");
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(status.textContent, "1 result for gradient");
    assert.ok(results.innerHTML.includes("/posts/gradient"));
    assert.ok(results.innerHTML.includes("Gradient &lt;Descent&gt;"));

    closeButton.dispatch("click");

    assert.equal(root.hidden, true);
    assert.equal(root.getAttribute("aria-hidden"), "true");
    assert.equal(openButton.attributes.has("data-command-active"), false);
    assert.equal(input.value, "");
    assert.equal(results.innerHTML, "");
    assert.equal(status.textContent, "");
    assert.equal(previousActiveElement.focused, true);
    assert.ok(documentHandlers.has("keydown"));
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
    globalThis.HTMLElement = originalHTMLElement;
  }
});

test("search page client script preserves URL-backed search behavior", async () => {
  const { setupSearchPage } = await loadProjectModule(
    "src/scripts/searchPage.ts",
    ["src/utils/search.ts", "src/scripts/searchPage.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalHistory = globalThis.history;
  const originalFetch = globalThis.fetch;
  const searchKinds = readJson("src/data/search-kinds.json");
  const makeElement = ({ dataset = {}, textContent = "" } = {}) => {
    const attributes = new Map();
    const handlers = new Map();
    return {
      dataset,
      handlers,
      innerHTML: "",
      textContent,
      value: "",
      addEventListener: (event, handler) => handlers.set(event, handler),
      removeEventListener: event => handlers.delete(event),
      dispatch: (event, payload = {}) => handlers.get(event)?.(payload),
      focus: () => {
        globalThis.document.activeElement = input;
      },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name),
      toggleAttribute: (name, active) => {
        if (active) attributes.set(name, "");
        else attributes.delete(name);
      },
      hasAttribute: name => attributes.has(name),
    };
  };
  const input = makeElement();
  const clearButton = makeElement();
  const status = makeElement();
  const results = makeElement();
  const kindData = makeElement({ textContent: JSON.stringify(searchKinds) });
  const allButton = makeElement({ dataset: { searchKind: "all" } });
  const postsButton = makeElement({ dataset: { searchKind: "posts" } });
  const notesButton = makeElement({ dataset: { searchKind: "notes" } });
  const location = {
    pathname: "/search",
    search: "?q=gradient&type=posts",
  };
  const history = {
    state: { from: "test" },
    replacedWith: "",
    replaceState: (_state, _title, url) => {
      history.replacedWith = url;
      const [pathname, search = ""] = url.split("?");
      location.pathname = pathname;
      location.search = search ? `?${search}` : "";
    },
  };

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        title: "Gradient <Descent>",
        description: "Optimization",
        url: "/posts/gradient",
        kind: "Post",
        metaText: "machine learning",
        content: "calculus gradient descent article",
      },
      {
        title: "Gradient note",
        description: "Daily note",
        url: "/notes/gradient",
        kind: "Note",
        metaText: "running",
        content: "gradient thought",
      },
    ],
  });
  globalThis.window = { location };
  globalThis.history = history;
  globalThis.document = {
    activeElement: null,
    querySelector: selector =>
      ({
        "#search-input": input,
        "#search-clear": clearButton,
        "#search-status": status,
        "#search-results": results,
        "#search-kind-data": kindData,
      })[selector] ?? null,
    querySelectorAll: selector =>
      selector === "[data-search-kind]"
        ? [allButton, postsButton, notesButton]
        : [],
  };

  try {
    setupSearchPage();
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(input.value, "gradient");
    assert.equal(postsButton.getAttribute("aria-pressed"), "true");
    assert.equal(notesButton.getAttribute("aria-pressed"), "false");
    assert.equal(status.textContent, "1 result for gradient in posts");
    assert.ok(results.innerHTML.includes("/posts/gradient"));
    assert.ok(results.innerHTML.includes("Gradient &lt;Descent&gt;"));
    assert.ok(!results.innerHTML.includes("/notes/gradient"));

    input.value = "note";
    input.dispatch("input", { currentTarget: input });
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(history.replacedWith, "/search?q=note&type=posts");
    assert.equal(status.textContent, "No results for note in posts");

    notesButton.dispatch("click");
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(history.replacedWith, "/search?q=note&type=notes");
    assert.equal(notesButton.getAttribute("aria-pressed"), "true");
    assert.equal(status.textContent, "1 result for note in notes");
    assert.ok(results.innerHTML.includes("/notes/gradient"));

    clearButton.dispatch("click");

    assert.equal(input.value, "");
    assert.equal(history.replacedWith, "/search?type=notes");
    assert.equal(status.textContent, "Type a keyword to search across notes.");
    assert.equal(results.innerHTML, "");
    assert.equal(globalThis.document.activeElement, input);
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.history = originalHistory;
    globalThis.fetch = originalFetch;
  }
});

test("OG image resolution is shared by post and project detail pages", async () => {
  const { resolveOgImage } = await loadTypeScriptModule("src/utils/ogImage.ts");
  const postDetails = readText("src/layouts/PostDetails.astro");
  const projectDetails = readText("src/pages/projects/[slug].astro");

  assert.equal(
    resolveOgImage("/images/example.png", "https://bogao.dev"),
    "https://bogao.dev/images/example.png"
  );
  assert.equal(
    resolveOgImage({ src: "/_astro/example.hash.png" }, "https://bogao.dev"),
    "https://bogao.dev/_astro/example.hash.png"
  );
  assert.ok(postDetails.includes("resolveOgImage(initOgImage"));
  assert.ok(projectDetails.includes("resolveOgImage(project.data.ogImage"));
});

test("post detail layout delegates client behavior to a script module", () => {
  const postDetails = readText("src/layouts/PostDetails.astro");
  const postDetailsScript = readText("src/scripts/postDetails.js");

  assert.ok(postDetails.includes('from "@/scripts/postDetails.js"'));
  assert.ok(!postDetails.includes("data-astro-rerun"));
  assert.ok(postDetailsScript.includes("export function setupPostDetailsPage"));
  assert.ok(postDetailsScript.includes("window.__postPageCleanup"));
  assert.ok(postDetailsScript.includes('document.getElementById("article")'));
});

test("content scripts share content rule contracts", async () => {
  const rules = readJson("src/data/content-rules.json");
  const contentConfig = readText("src/content.config.ts");
  const checkContent = readText("scripts/check-content.mjs");
  const newContent = readText("scripts/new-content.mjs");
  const contentRules = await import(
    pathToFileURL(path.join(ROOT, "scripts/content-rules.mjs")).href
  );

  assert.deepEqual(Object.keys(rules.collections), [
    "blog",
    "notes",
    "projects",
  ]);
  assert.deepEqual(rules.collections.blog.frontmatterFields, [
    "author",
    "pubDatetime",
    "modDatetime",
    "title",
    "slug",
    "draft",
    "tags",
    "ogImage",
    "description",
    "canonicalURL",
  ]);
  assert.deepEqual(rules.projectStatuses, [
    "active",
    "shipping",
    "archived",
    "lab",
  ]);
  assert.equal(contentRules.getContentDir("post"), "src/content/blog");
  assert.equal(
    contentRules.slugifyForContent("Custom Slug.md", {
      stripMarkdownExt: true,
    }),
    "custom-slug"
  );
  assert.equal(
    contentRules.slugifyForContent("Custom Slug.md"),
    "custom-slug.md"
  );
  assert.ok(contentConfig.includes("content-rules.json"));
  assert.ok(checkContent.includes('from "./content-rules.mjs"'));
  assert.ok(newContent.includes('from "./content-rules.mjs"'));
});

test("content scripts resolve repository root outside the cwd", () => {
  const output = execFileSync(
    process.execPath,
    ["../scripts/check-content.mjs"],
    {
      cwd: path.join(ROOT, "src"),
      encoding: "utf8",
    }
  );
  const contentRules = readText("scripts/content-rules.mjs");
  const checkContent = readText("scripts/check-content.mjs");
  const newContent = readText("scripts/new-content.mjs");

  assert.match(output, /Content check passed\./);
  assert.ok(contentRules.includes("fileURLToPath(import.meta.url)"));
  assert.ok(contentRules.includes("export const REPO_ROOT"));
  assert.ok(checkContent.includes("REPO_ROOT"));
  assert.ok(newContent.includes("REPO_ROOT"));
  assert.ok(!checkContent.includes("const ROOT = process.cwd()"));
  assert.ok(!newContent.includes("const ROOT = process.cwd()"));
});

test("content check frontmatter parser handles current template shapes", async () => {
  const { parseFrontmatter } = await import(
    pathToFileURL(path.join(ROOT, "scripts/check-content.mjs")).href
  );

  const { data, raw } = parseFrontmatter(
    "example.md",
    [
      "---",
      'title: "A title: with punctuation"',
      "draft: false",
      "order: -1",
      "tags:",
      "  - Machine Learning",
      '  - "LLMs"',
      "modDatetime:",
      "---",
      "Body",
    ].join("\n")
  );

  assert.equal(data.title, "A title: with punctuation");
  assert.equal(data.draft, false);
  assert.equal(data.order, -1);
  assert.deepEqual(data.tags, ["Machine Learning", "LLMs"]);
  assert.equal(data.modDatetime, "");
  assert.equal(raw.title, '"A title: with punctuation"');
});

test("public image dimensions point at existing files", () => {
  const dimensions = readJson("src/data/public-image-dimensions.json");

  for (const [src, size] of Object.entries(dimensions)) {
    assert.ok(src.startsWith("/images/"), `${src} must be a public image`);
    assert.ok(
      fs.existsSync(path.join(ROOT, "public", src)),
      `${src} must exist under public/`
    );
    assert.ok(Number.isInteger(size.width) && size.width > 0);
    assert.ok(Number.isInteger(size.height) && size.height > 0);
  }
});

test("project URLs are filename-driven, not frontmatter slug-driven", () => {
  const projectFiles = fs
    .readdirSync(path.join(ROOT, "src/content/projects"))
    .filter(file => file.endsWith(".md"));

  for (const file of projectFiles) {
    const source = readText(`src/content/projects/${file}`);
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    assert.ok(
      !/^slug:/m.test(frontmatter),
      `${file} should not define a project slug`
    );
  }
});

test("project list and latest-project ordering contracts stay distinct", async () => {
  const { default: getSortedProjects } = await loadTypeScriptModule(
    "src/utils/getSortedProjects.ts"
  );
  const { default: getLatestProjects } = await loadTypeScriptModule(
    "src/utils/getLatestProjects.ts"
  );
  const projects = [
    {
      id: "older-featured.md",
      data: {
        draft: false,
        featured: true,
        order: 10,
        startDate: new Date("2026-01-01"),
        year: 2026,
        status: "active",
      },
    },
    {
      id: "newer-auto.md",
      data: {
        draft: false,
        featured: false,
        order: -1,
        startDate: new Date("2026-06-01"),
        year: 2026,
        status: "shipping",
      },
    },
    {
      id: "manual-first.md",
      data: {
        draft: false,
        featured: false,
        order: 1,
        startDate: new Date("2026-03-01"),
        year: 2026,
        status: "lab",
      },
    },
  ];

  assert.deepEqual(
    getSortedProjects(projects).map(project => project.id),
    ["older-featured.md", "manual-first.md", "newer-auto.md"]
  );
  assert.deepEqual(
    getLatestProjects(projects, 2).map(project => project.id),
    ["newer-auto.md", "manual-first.md"]
  );
});

test("stale blog metadata fields stay removed", () => {
  const contentConfig = readText("src/content.config.ts");
  const siteConfig = readText("src/config.ts");

  assert.ok(!contentConfig.includes("featured: z.boolean().optional()"));
  assert.ok(!contentConfig.includes("timezone: z.string().optional()"));
  assert.ok(!siteConfig.includes("postPerIndex"));
  assert.ok(!siteConfig.includes("timezone:"));
});

test("vercel redirects point at current generated content routes", () => {
  const vercelConfig = readJson("vercel.json");
  const knownRoutes = new Set([
    "/",
    "/404",
    "/about",
    "/archives",
    "/notes",
    "/posts",
    "/projects",
    "/search",
    "/tags",
  ]);

  for (const file of listMarkdownFiles("src/content/blog")) {
    const frontmatter = parseFrontmatter(file);
    knownRoutes.add(
      `/posts/${getFrontmatterField(frontmatter, "slug") ?? stripMarkdownExt(path.basename(file))}`
    );
  }

  for (const file of listMarkdownFiles("src/content/notes")) {
    const frontmatter = parseFrontmatter(file);
    knownRoutes.add(
      `/notes/${getFrontmatterField(frontmatter, "slug") ?? stripMarkdownExt(path.basename(file))}`
    );
  }

  for (const file of listMarkdownFiles("src/content/projects")) {
    knownRoutes.add(
      `/projects/${stripMarkdownExt(path.basename(file)).toLowerCase()}`
    );
  }

  for (const redirect of vercelConfig.redirects) {
    assert.ok(
      knownRoutes.has(redirect.destination.replace(/\/+$/, "")),
      `${redirect.source} points at missing destination ${redirect.destination}`
    );
  }
});
