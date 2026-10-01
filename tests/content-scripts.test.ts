import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseFrontmatter } from "../scripts/check-content.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

// The scripts resolve paths from their own location, so each test runs them
// from a throwaway copy of the files they read.
const FIXTURE_FILES = [
  "scripts/content-rules.mjs",
  "scripts/check-content.mjs",
  "scripts/new-content.mjs",
  "src/data/content-rules.json",
  "src/utils/slugifyCore.js",
  "templates/blog-post.md",
  "templates/project.md",
];

let fixture: string | undefined;

const createFixture = () => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), "bogao-content-"));
  fs.symlinkSync(
    path.join(ROOT, "node_modules"),
    path.join(fixture, "node_modules"),
    "dir"
  );
  for (const file of FIXTURE_FILES) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), target);
  }
  return fixture;
};

afterEach(() => {
  if (fixture) fs.rmSync(fixture, { recursive: true, force: true });
  fixture = undefined;
});

const run = (cwd: string, ...args: string[]) =>
  execFileSync(process.execPath, args, { cwd, encoding: "utf8" });

const read = (dir: string, file: string) =>
  fs.readFileSync(path.join(dir, file), "utf8");

const write = (dir: string, file: string, content: string) => {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), content);
};

const frontmatterOf = (source: string) =>
  source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";

describe("new-content", () => {
  it("creates a draft post with an explicit slug and the default author", () => {
    const dir = createFixture();
    const output = run(
      dir,
      "scripts/new-content.mjs",
      "post",
      "Tagged Post",
      "--date",
      "2026-06-22",
      "--tags",
      "running, life"
    );
    const frontmatter = frontmatterOf(
      read(dir, "src/content/blog/tagged-post.md")
    );

    expect(output).toContain("Created src/content/blog/tagged-post.md");
    expect(frontmatter).toMatch(/^pubDatetime: 2026-06-22$/m);
    expect(frontmatter).toMatch(/^slug: "tagged-post"$/m);
    expect(frontmatter).toMatch(/^draft: true$/m);
    expect(frontmatter).toMatch(/^tags:\n {2}- "running"\n {2}- "life"$/m);
    // The schema defaults the author to SITE.author.
    expect(frontmatter).not.toMatch(/^author:/m);
  });

  it("creates a draft project whose URL comes from the file name", () => {
    const dir = createFixture();
    run(
      dir,
      "scripts/new-content.mjs",
      "project",
      "Agent Notes",
      "--date",
      "2026-06-22",
      "--stack",
      "Astro, Tests",
      "--repoUrl",
      "https://github.com/example/repo"
    );
    const frontmatter = frontmatterOf(
      read(dir, "src/content/projects/agent-notes.md")
    );

    expect(frontmatter).toMatch(/^status: "active"$/m);
    expect(frontmatter).toMatch(/^startDate: 2026-06-22$/m);
    expect(frontmatter).toMatch(/^year: 2026$/m);
    expect(frontmatter).toMatch(/^ {2}- "Astro"\n {2}- "Tests"$/m);
    expect(frontmatter).toMatch(
      /^repoUrl: "https:\/\/github\.com\/example\/repo"$/m
    );
    expect(frontmatter).not.toMatch(/^slug:/m);
  });

  it("refuses unknown options and existing files", () => {
    const dir = createFixture();
    const unknown = spawnSync(
      process.execPath,
      ["scripts/new-content.mjs", "post", "Title", "--nope", "x"],
      { cwd: dir, encoding: "utf8" }
    );
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain("Unsupported option for post: --nope");

    run(dir, "scripts/new-content.mjs", "post", "Title");
    const duplicate = spawnSync(
      process.execPath,
      ["scripts/new-content.mjs", "post", "Title"],
      { cwd: dir, encoding: "utf8" }
    );
    expect(duplicate.status).toBe(1);
    expect(duplicate.stderr).toContain("Refusing to overwrite");
  });
});

describe("check-content", () => {
  const checkContent = (dir: string) =>
    spawnSync(process.execPath, ["scripts/check-content.mjs"], {
      cwd: dir,
      encoding: "utf8",
    });

  it("passes the repository's own content", () => {
    // Run from a subdirectory: the script must not depend on the cwd.
    const output = run(
      path.join(ROOT, "src"),
      path.join(ROOT, "scripts/check-content.mjs")
    );
    expect(output).toContain("Content check passed.");
  });

  it("warns about implicit post slugs", () => {
    const dir = createFixture();
    write(
      dir,
      "src/content/blog/implicit-post.md",
      [
        "---",
        "pubDatetime: 2026-06-22",
        "title: Implicit Post",
        "description: Post without an explicit slug.",
        "tags: []",
        "---",
        "Body",
      ].join("\n")
    );

    const result = checkContent(dir);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain(
      "src/content/blog/implicit-post.md: add an explicit slug"
    );
  });

  it("rejects project slugs, unknown fields and duplicate URLs", () => {
    const dir = createFixture();
    const projectSource = (extra: string) =>
      [
        "---",
        'title: "Project"',
        'description: "About it"',
        'status: "active"',
        "order: 1",
        extra,
        "---",
      ].join("\n");
    write(dir, "src/content/projects/one.md", projectSource('slug: "two"'));
    write(
      dir,
      "src/content/projects/nested/One.md",
      projectSource("color: red")
    );

    const result = checkContent(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "project slug is derived from the filename"
    );
    expect(result.stderr).toContain("unknown frontmatter field color");
    expect(result.stderr).toContain('duplicate project slug "one"');
  });

  it("checks case-study metrics and cover", () => {
    const dir = createFixture();
    write(
      dir,
      "src/content/projects/case.md",
      [
        "---",
        'title: "Case"',
        'description: "About it"',
        'status: "active"',
        "order: 1",
        "metrics:",
        '  - value: "+12%"',
        '  - label: "No value"',
        "cover:",
        '  src: "./diagram.png"',
        "---",
      ].join("\n")
    );

    const result = checkContent(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("metrics[0] needs a value and a label");
    expect(result.stderr).toContain("metrics[1] needs a value and a label");
    expect(result.stderr).toContain("cover needs a src and alt text");
  });

  it("parses frontmatter as YAML", () => {
    const data = parseFrontmatter(
      "example.md",
      [
        "---",
        'title: "A title: with punctuation"',
        "draft: false",
        "order: -1",
        "tags: [Machine Learning, LLMs]",
        "description: >-",
        "  Folded",
        "  text",
        "pubDatetime: 2026-06-22",
        "modDatetime:",
        "---",
        "Body",
      ].join("\r\n")
    );

    expect(data).toEqual({
      title: "A title: with punctuation",
      draft: false,
      order: -1,
      tags: ["Machine Learning", "LLMs"],
      description: "Folded text",
      pubDatetime: "2026-06-22",
      modDatetime: null,
    });
  });

  it("accepts dates and zoned datetimes only", () => {
    const dir = createFixture();
    const postWithDate = (slug: string, pubDatetime: string) =>
      write(
        dir,
        `src/content/blog/${slug}.md`,
        [
          "---",
          `pubDatetime: ${pubDatetime}`,
          `title: ${slug}`,
          `slug: ${slug}`,
          "description: About it",
          "tags: []",
          "---",
        ].join("\n")
      );
    postWithDate("date", "2026-06-22");
    postWithDate("utc", "2026-06-22T09:30:00Z");
    postWithDate("offset", "2026-06-22T09:30+08:00");
    postWithDate("floating", "2026-06-22T09:30");

    const result = checkContent(dir);
    expect(result.status).toBe(1);
    expect(result.stderr.trim().split("\n")).toEqual([
      expect.stringContaining("floating.md: pubDatetime must be YYYY-MM-DD"),
    ]);
  });
});
