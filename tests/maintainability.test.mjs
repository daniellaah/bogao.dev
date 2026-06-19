import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import ts from "typescript";

const ROOT = process.cwd();

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

test("breadcrumb handles language post routes before generic post routes", async () => {
  const { getBreadcrumbList } = await loadTypeScriptModule(
    "src/utils/breadcrumb.ts"
  );

  assert.deepEqual(getBreadcrumbList("/posts/"), ["Posts (page 1)"]);
  assert.deepEqual(getBreadcrumbList("/posts/2/"), ["Posts (page 2)"]);
  assert.deepEqual(getBreadcrumbList("/posts/lang/en/"), ["Posts"]);
  assert.deepEqual(getBreadcrumbList("/posts/lang/zh-cn/"), ["Posts"]);
  assert.deepEqual(getBreadcrumbList("/posts/lang/zh-cn/2/"), [
    "Posts (page 2)",
  ]);
  assert.deepEqual(getBreadcrumbList("/tags/machine-learning/2/"), [
    "tags",
    "machine-learning (page 2)",
  ]);
});

test("search kind contract stays explicit and shared", () => {
  const searchKinds = readJson("src/data/search-kinds.json");

  assert.deepEqual(
    searchKinds.map(kind => kind.filter),
    ["all", "posts", "notes", "projects"]
  );
  assert.deepEqual(
    searchKinds.map(kind => kind.recordKind),
    [null, "Post", "Note", "Project"]
  );
  assert.equal(new Set(searchKinds.map(kind => kind.filter)).size, 4);
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
