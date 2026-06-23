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
        /(from\s+["'])(\.\/[^"']+)(["'])/g,
        "$1$2.mjs$3"
      );
      const outputFile = path.join(
        tempDir,
        path.basename(modulePath).replace(/\.(ts|js|mjs)$/, ".mjs")
      );
      fs.writeFileSync(outputFile, withResolvableImports);
    }

    return await import(
      pathToFileURL(
        path.join(
          tempDir,
          path.basename(entryPath).replace(/\.(ts|js|mjs)$/, ".mjs")
        )
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
    "src/utils/contentPaths.ts",
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
  const contentPaths = readText("src/utils/contentPaths.ts");
  const rules = readJson("src/data/content-rules.json");

  assert.ok(contentSlug.includes("export const getPathSegmentSlug"));
  assert.ok(!contentSlug.includes("export const stripMarkdownExt"));
  assert.ok(getPath.includes("getPathSegmentSlug(segment)"));
  assert.ok(!getPath.includes("@/content.config"));
  assert.ok(contentPaths.includes(rules.collections.blog.dir));
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
  assert.ok(searchPage.includes("rankSearchRecords(visibleRecords, terms)"));
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
  const commandPalette = readText("src/components/CommandPalette.astro");

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
  assert.ok(searchPage.includes('from "@/utils/search"'));
  assert.ok(commandPalette.includes('from "@/utils/search"'));
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
  const makeButton = (value, metrics) => {
    const attributes = new Map();
    return {
      dataset: { tagSort: value },
      offsetLeft: metrics.left,
      offsetTop: metrics.top,
      offsetWidth: metrics.width,
      offsetHeight: metrics.height,
      toggleAttribute: (name, active) => {
        if (active) attributes.set(name, "");
        else attributes.delete(name);
      },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name),
      hasAttribute: name => attributes.has(name),
    };
  };
  const popularButton = makeButton("popular", {
    left: 0,
    top: 0,
    width: 48,
    height: 32,
  });
  const azButton = makeButton("az", {
    left: 56,
    top: 4,
    width: 36,
    height: 28,
  });

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

test("tags index client script preserves sort state behavior", async () => {
  const { setupTagsIndexPage } = await loadProjectModule(
    "src/scripts/tagsIndex.ts",
    ["src/scripts/toggleControls.ts", "src/scripts/tagsIndex.ts"]
  );
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const appendedCards = [];
  const indicatorStyles = new Map();
  const makeButton = (value, metrics) => {
    const attributes = new Map();
    let clickHandler = () => {};
    return {
      dataset: { tagSort: value },
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
  const popularButton = makeButton("popular", {
    left: 0,
    top: 0,
    width: 48,
    height: 32,
  });
  const azButton = makeButton("az", {
    left: 56,
    top: 4,
    width: 36,
    height: 28,
  });
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
