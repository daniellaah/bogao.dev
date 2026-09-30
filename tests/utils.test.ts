import { describe, expect, it, vi } from "vitest";
import type { CollectionEntry } from "astro:content";
import { getProjectAccent } from "@/utils/accent";
import { getBreadcrumbList } from "@/utils/breadcrumb";
import dayjs from "@/utils/dayjs";
import { getPostPath } from "@/utils/getPostPath";
import { getProjectPath } from "@/utils/getProjectPath";
import getSortedPosts from "@/utils/getSortedPosts";
import getSortedProjects from "@/utils/getSortedProjects";
import getUniqueTags from "@/utils/getUniqueTags";
import { getMergedPrsUrl, summarizeMergedPrs } from "@/utils/mergedPrs";
import {
  getContentLang,
  getInlineLang,
  getOgLocale,
} from "@/utils/contentLang";
import { resolveOgImage } from "@/utils/ogImage";
import { getReadingMinutes } from "@/utils/readingTime";
import rehypeHeadingText from "@/utils/rehypeHeadingText";
import {
  buildSearchExcerpt,
  createSearchIndexLoader,
  escapeSearchHtml,
  rankSearchRecords,
  scoreSearchRecord,
  splitSearchTerms,
  type SearchRecord,
} from "@/utils/search";
import { slugifyForContent, slugifyStr } from "@/utils/slugifyCore";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { collectTagStats } from "@/utils/tags";
import { getTocHeadings } from "@/utils/toc";

const post = (
  id: string,
  data: Partial<CollectionEntry<"blog">["data"]>,
  filePath = `src/content/blog/${id}.md`
) =>
  ({
    id,
    filePath,
    collection: "blog",
    data: { draft: false, tags: [], ...data },
  }) as unknown as CollectionEntry<"blog">;

const project = (
  id: string,
  data: Partial<CollectionEntry<"projects">["data"]>
) =>
  ({
    id,
    collection: "projects",
    data: {
      draft: false,
      featured: false,
      order: 99,
      status: "active",
      ...data,
    },
  }) as unknown as CollectionEntry<"projects">;

describe("content URLs", () => {
  it("builds post paths from the explicit slug and nested folders", () => {
    const nested = post(
      "stable-custom-slug",
      { slug: "Stable Custom Slug" },
      "src/content/blog/ML Notes/Example Post.md"
    );

    expect(getPostPath(nested)).toBe("/posts/ml-notes/stable-custom-slug");
    expect(getPostPath(nested, false)).toBe("ml-notes/stable-custom-slug");
  });

  it("falls back to the entry id and skips underscore folders", () => {
    expect(
      getPostPath(
        post("example-post", {}, "src/content/blog/_drafts/Example Post.md")
      )
    ).toBe("/posts/example-post");
  });

  it("derives project paths from the file name", () => {
    expect(getProjectPath("bogaodev")).toBe("/projects/bogaodev");
    expect(getProjectPath("ARKB.md")).toBe("/projects/arkb");
  });

  it("slugifies Latin and non-Latin text", () => {
    expect(slugifyStr("Machine Learning")).toBe("machine-learning");
    expect(slugifyStr("检索 系统")).toBe("检索-系统");
    expect(
      slugifyForContent("Custom Slug.md", { stripMarkdownExt: true })
    ).toBe("custom-slug");
    expect(slugifyForContent("---")).toBe("untitled");
  });
});

describe("post and project ordering", () => {
  it("keeps published posts, newest first", () => {
    vi.stubEnv("DEV", false);
    const posts = [
      post("older", { pubDatetime: new Date("2024-01-01") }),
      post("draft", { pubDatetime: new Date("2024-03-01"), draft: true }),
      post("undated", {}),
      post("future", { pubDatetime: new Date("2999-01-01") }),
      post("newer", { pubDatetime: new Date("2024-02-01") }),
    ];

    expect(getSortedPosts(posts).map(({ id }) => id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("shows scheduled posts in development", () => {
    vi.stubEnv("DEV", true);
    const posts = [post("future", { pubDatetime: new Date("2999-01-01") })];

    expect(getSortedPosts(posts).map(({ id }) => id)).toEqual(["future"]);
  });

  it("orders projects by featured, manual order, then start date", () => {
    const projects = [
      project("older-featured", { featured: true, order: 10 }),
      project("newer-auto", {
        order: -1,
        startDate: new Date("2026-06-01"),
      }),
      project("manual-first", { order: 1 }),
      project("draft", { draft: true, featured: true, order: 0 }),
    ];

    expect(getSortedProjects(projects).map(({ id }) => id)).toEqual([
      "older-featured",
      "manual-first",
      "newer-auto",
    ]);
  });

  it("gives each project a stable accent by position", () => {
    const ids = ["a", "b", "c", "d", "e"];
    expect(ids.map(id => getProjectAccent(id, ids))).toEqual([
      "yellow",
      "blue",
      "pink",
      "green",
      "yellow",
    ]);
  });
});

describe("tags", () => {
  it("counts each tag once per post and skips drafts", () => {
    const stats = collectTagStats([
      { tags: ["Machine Learning", "Machine Learning", "LLMs"] },
      { tags: ["machine learning", "Running"] },
      { tags: ["Draft"], draft: true },
    ]);

    expect(
      Object.fromEntries(stats.map(({ slug, postCount }) => [slug, postCount]))
    ).toEqual({ llms: 1, "machine-learning": 2, running: 1 });
  });

  it("sorts unique tags by slug for the search index", () => {
    expect(
      getUniqueTags([
        { data: { tags: ["Running"] } },
        { data: { tags: ["Machine Learning"] } },
      ])
    ).toEqual([
      { tag: "machine-learning", tagName: "Machine Learning", count: 1 },
      { tag: "running", tagName: "Running", count: 1 },
    ]);
  });
});

describe("search", () => {
  const record = (overrides: Partial<SearchRecord>): SearchRecord => ({
    title: "Gradient descent",
    description: "Optimization",
    url: "/posts/example",
    kind: "Post",
    metaText: "machine learning",
    content: "calculus notes",
    ...overrides,
  });

  it("splits queries into terms, keeping CJK phrases whole", () => {
    expect(splitSearchTerms(" Machine   Learning ")).toEqual([
      "machine",
      "learning",
    ]);
    expect(splitSearchTerms("机器学习")).toEqual(["机器学习"]);
    expect(splitSearchTerms("   ")).toEqual([]);
  });

  it("weights title over description, meta and body, and requires all terms", () => {
    expect(scoreSearchRecord(record({}), ["gradient"])?.score).toBe(12);
    expect(scoreSearchRecord(record({}), ["machine", "learning"])?.score).toBe(
      10
    );
    expect(scoreSearchRecord(record({}), ["gradient", "missing"])).toBeNull();
  });

  it("dedupes by kind and URL, keeping the best match", () => {
    const ranked = rankSearchRecords(
      [
        record({}),
        record({
          title: "Duplicate",
          metaText: "",
          content: "machine learning",
        }),
      ],
      ["machine", "learning"]
    );

    expect(ranked.map(({ title }) => title)).toEqual(["Gradient descent"]);
  });

  it("excerpts around the first match", () => {
    expect(
      buildSearchExcerpt(
        "Intro text before a longer setup paragraph with enough words before gradient descent notes and more context after.",
        ["gradient"]
      )
    ).toBe(
      "...longer setup paragraph with enough words before gradient descent notes and more context after."
    );
    expect(buildSearchExcerpt("Short content", ["missing"])).toBe(
      "Short content"
    );
  });

  it("escapes HTML in rendered results", () => {
    expect(escapeSearchHtml(`<tag>&"'`)).toBe("&lt;tag&gt;&amp;&quot;&#39;");
  });

  it("caches the index and retries after a failed request", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => [record({})] });
    const load = createSearchIndexLoader(fetcher as unknown as typeof fetch);

    await expect(load()).rejects.toThrow("Search index request failed.");
    expect((await load())[0].title).toBe("Gradient descent");
    await load();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("indexes plain text without code, images, math or HTML", () => {
    expect(
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
      )
    ).toBe("Heading Visible link text and . and html text");
  });
});

describe("post details", () => {
  it("formats content dates in UTC", () => {
    expect(dayjs.utc("2026-03-07T00:30:00-08:00").format("D MMM YYYY")).toBe(
      "7 Mar 2026"
    );
  });

  it("counts English words and CJK characters for reading time", () => {
    expect(getReadingMinutes("")).toBe(1);
    expect(getReadingMinutes("word ".repeat(460))).toBe(2);
    expect(getReadingMinutes("检".repeat(800))).toBe(2);
    expect(getReadingMinutes("word ".repeat(230) + "— — — ---")).toBe(1);
  });

  it("builds the TOC from readable heading text", () => {
    const headings = [
      { depth: 1, slug: "title", text: "Title" },
      { depth: 2, slug: "what-k-controls", text: "What kkk controls" },
      { depth: 3, slug: "details", text: "Details" },
      { depth: 4, slug: "deep", text: "Deep" },
    ];

    expect(
      getTocHeadings(headings, { "what-k-controls": "What k controls" }).map(
        ({ text }) => text
      )
    ).toEqual(["What k controls", "Details", "Deep"]);
    expect(
      getTocHeadings(headings, undefined, { depths: [2, 3] }).map(
        ({ slug }) => slug
      )
    ).toEqual(["what-k-controls", "details"]);
  });

  it("records heading text before math is rendered", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [
            { type: "text", value: "What " },
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-math"] },
              children: [{ type: "text", value: "k" }],
            },
            { type: "text", value: " controls" },
          ],
        },
        {
          type: "element",
          tagName: "h3",
          properties: { id: "custom" },
          children: [{ type: "text", value: "Custom id" }],
        },
      ],
    };
    const file = {
      data: {} as { astro?: { frontmatter?: Record<string, unknown> } },
    };

    rehypeHeadingText()(tree, file);

    expect(tree.children[0].properties).toEqual({ id: "what-k-controls" });
    expect(file.data.astro?.frontmatter).toEqual({
      headingText: {
        "what-k-controls": "What k controls",
        custom: "Custom id",
      },
    });
  });

  it("detects the content language unless frontmatter sets it", () => {
    const zh = { title: "为什么 BM25 还没有过时", description: "检索基线" };
    const en = { title: "Hybrid Retrieval", description: "RRF" };

    expect(getContentLang(zh)).toBe("zh-CN");
    expect(getContentLang(en)).toBe("en");
    expect(getContentLang({ ...zh, lang: "ja" })).toBe("ja");
    expect(getInlineLang(en)).toBeUndefined();
    expect(getInlineLang(zh)).toBe("zh-CN");
    expect(getOgLocale("zh-CN")).toBe("zh_CN");
    expect(getOgLocale("en")).toBe("en_US");
  });

  it("resolves OG images from paths and imported images", () => {
    expect(resolveOgImage("/images/example.png", "https://bogao.dev")).toBe(
      "https://bogao.dev/images/example.png"
    );
    expect(
      resolveOgImage({ src: "/_astro/example.hash.png" }, "https://bogao.dev")
    ).toBe("https://bogao.dev/_astro/example.hash.png");
    expect(resolveOgImage(undefined, "https://bogao.dev")).toBeUndefined();
  });

  it("labels paginated list routes in the breadcrumb", () => {
    expect(getBreadcrumbList("/posts/")).toEqual(["Posts (page 1)"]);
    expect(getBreadcrumbList("/posts/2/")).toEqual(["Posts (page 2)"]);
    expect(getBreadcrumbList("/tags/machine-learning/2/")).toEqual([
      "tags",
      "machine-learning (page 2)",
    ]);
  });
});

describe("merged PR preview", () => {
  const item = (number: number, mergedAt: string | null) => ({
    number,
    title: `PR ${number}`,
    html_url: `https://github.com/o/r/pull/${number}`,
    pull_request: { merged_at: mergedAt },
  });

  it("picks the most recently merged PR", () => {
    const summary = summarizeMergedPrs({
      total_count: 3,
      items: [
        item(10, "2026-03-01T00:00:00Z"),
        item(12, "2026-09-01T00:00:00Z"),
        item(11, "2026-06-01T00:00:00Z"),
        item(13, null),
      ],
    });

    expect(summary).toMatchObject({ number: 12, total: 3 });
    expect(summary?.mergedAt.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(summarizeMergedPrs({ total_count: 0, items: [] })).toBeUndefined();
  });

  it("links to the author's merged PRs", () => {
    expect(getMergedPrsUrl("o/r", "me")).toBe(
      "https://github.com/o/r/pulls?q=is%3Apr%20is%3Amerged%20author%3Ame"
    );
  });
});
