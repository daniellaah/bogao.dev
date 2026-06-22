import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const MODULE_TEST_CACHE_DIR = path.join(
  ROOT,
  "node_modules",
  ".cache",
  "maintainability-tests"
);

const readText = relativePath =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = relativePath => JSON.parse(readText(relativePath));

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

  try {
    for (const modulePath of modulePaths) {
      let source = readText(modulePath);
      if (modulePath === "src/utils/getPath.ts") {
        source = source.replace(
          'import { BLOG_PATH } from "@/content.config";',
          'const BLOG_PATH = "src/content/blog";'
        );
      }

      const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ES2022,
          target: ts.ScriptTarget.ES2022,
        },
      });
      const withResolvableImports = outputText.replace(
        /(from\s+["'])(\.\/[^"']+)(["'])/g,
        "$1$2.mjs$3"
      );
      const outputFile = path.join(
        tempDir,
        path.basename(modulePath).replace(/\.ts$/, ".mjs")
      );
      fs.writeFileSync(outputFile, withResolvableImports);
    }

    return await import(
      pathToFileURL(
        path.join(tempDir, path.basename(entryPath).replace(/\.ts$/, ".mjs"))
      ).href
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const loadSearchIndexInternals = async () => {
  const source = readText("src/pages/search-index.json.ts")
    .replace(/^import .*$/gm, "")
    .replace(/const SEARCH_RECORD_KINDS =[\s\S]*?const stripMarkdown/, "const stripMarkdown")
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
  assert.ok(searchPage.includes("`${record.kind}:${record.url}`"));
});

test("search index content strips markdown-only markup", async () => {
  const { stripMarkdown } = await loadSearchIndexInternals();

  assert.equal(
    stripMarkdown([
      "# Heading",
      "Visible [link text](/posts/example) and ![image alt](/image.png).",
      "`inline code` and $x + y$",
      "```js",
      "console.log('hidden')",
      "```",
      "<strong>html text</strong>",
    ].join("\n")),
    "Heading Visible link text and . and html text"
  );
});

test("search UI helpers share ranking and query parsing rules", async () => {
  const {
    escapeSearchHtml,
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
  assert.ok(searchPage.includes('from "@/utils/search"'));
  assert.ok(commandPalette.includes('from "@/utils/search"'));
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
  const output = execFileSync(process.execPath, [
    "../scripts/check-content.mjs",
  ], {
    cwd: path.join(ROOT, "src"),
    encoding: "utf8",
  });
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

test("stale blog metadata fields stay removed", () => {
  const contentConfig = readText("src/content.config.ts");
  const siteConfig = readText("src/config.ts");

  assert.ok(!contentConfig.includes("featured: z.boolean().optional()"));
  assert.ok(!contentConfig.includes("timezone: z.string().optional()"));
  assert.ok(!siteConfig.includes("postPerIndex"));
  assert.ok(!siteConfig.includes("timezone:"));
});
