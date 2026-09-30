import { describe, expect, it, vi } from "vitest";
import type { CollectionEntry } from "astro:content";
import { getBreadcrumbList } from "@/utils/breadcrumb";
import { formatDate, getYear, isSameDay } from "@/utils/date";
import { getPostPath, sortPosts } from "@/utils/posts";
import { getProjectPath, getProjectSlug, sortProjects } from "@/utils/projects";
import { getMergedPrsUrl, summarizeMergedPrs } from "@/utils/mergedPrs";
import { transformerFileName } from "@/utils/transformers/fileName";
import { codeToHtml } from "shiki";
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
  highlightSearchTerms,
  rankSearchRecords,
  scoreSearchRecord,
  splitSearchTerms,
  type SearchRecord,
} from "@/utils/search";
import { slugifyForContent, slugifyStr } from "@/utils/slugifyCore";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { collectTagStats, getTagPath } from "@/utils/tags";
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

    expect(getPostPath(nested)).toBe("/posts/ml-notes/stable-custom-slug/");
    expect(getPostPath(nested, false)).toBe("ml-notes/stable-custom-slug");
  });

  it("falls back to the entry id and skips underscore folders", () => {
    expect(
      getPostPath(
        post("example-post", {}, "src/content/blog/_drafts/Example Post.md")
      )
    ).toBe("/posts/example-post/");
  });

  it("derives project paths from the file name", () => {
    expect(getProjectPath("bogaodev")).toBe("/projects/bogaodev/");
    expect(getProjectSlug("ARKB.md")).toBe("arkb");
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

    expect(sortPosts(posts).map(({ id }) => id)).toEqual(["newer", "older"]);
  });

  it("shows scheduled posts in development", () => {
    vi.stubEnv("DEV", true);
    const posts = [post("future", { pubDatetime: new Date("2999-01-01") })];

    expect(sortPosts(posts).map(({ id }) => id)).toEqual(["future"]);
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

    expect(sortProjects(projects).map(({ id }) => id)).toEqual([
      "older-featured",
      "manual-first",
      "newer-auto",
    ]);
  });

  it("sorts start-dated projects newest first", () => {
    const projects = [
      project("old", { order: -1, startDate: new Date("2025-01-01") }),
      project("new", { order: -1, startDate: new Date("2026-01-01") }),
    ];

    expect(sortProjects(projects).map(({ id }) => id)).toEqual(["new", "old"]);
  });

  it("gives each project a stable accent by position", () => {
    const projects = ["a", "b", "c", "d", "e"].map((id, index) =>
      project(id, { order: index })
    );
    expect(sortProjects(projects).map(({ accent }) => accent)).toEqual([
      "yellow",
      "blue",
      "pink",
      "green",
      "yellow",
    ]);
  });
});

describe("tags", () => {
  const tagged = (...tags: string[]) => ({ data: { tags } });

  it("counts each tag once per post, merging spellings, sorted by slug", () => {
    expect(
      collectTagStats([
        tagged("Machine Learning", "Machine Learning", "LLMs"),
        tagged("machine learning", "Running"),
      ])
    ).toEqual([
      { slug: "llms", tagName: "LLMs", count: 1 },
      { slug: "machine-learning", tagName: "Machine Learning", count: 2 },
      { slug: "running", tagName: "Running", count: 1 },
    ]);
  });

  it("links to the tag page", () => {
    expect(getTagPath("machine-learning")).toBe("/tags/machine-learning/");
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
    expect(splitSearchTerms("けんさく")).toEqual(["けんさく"]);
    expect(splitSearchTerms("   ")).toEqual([]);
  });

  it("weights title over description, meta and body, and requires all terms", () => {
    expect(scoreSearchRecord(record({}), ["gradient"])?.score).toBe(12);
    expect(scoreSearchRecord(record({}), ["machine", "learning"])?.score).toBe(
      10
    );
    expect(scoreSearchRecord(record({}), ["gradient", "missing"])).toBeNull();
  });

  it("ranks by score, then title, up to the limit", () => {
    const ranked = rankSearchRecords(
      [
        record({ title: "B body match", metaText: "", content: "gradient" }),
        record({ title: "A body match", metaText: "", content: "gradient" }),
        record({}),
      ],
      ["gradient"],
      2
    );

    expect(ranked.map(({ title }) => title)).toEqual([
      "Gradient descent",
      "A body match",
    ]);
  });

  it("excerpts around the first match on word boundaries", () => {
    const text =
      "Intro text before a longer setup paragraph with enough words before gradient descent notes and more context after the match, so much context that the excerpt has to stop somewhere reasonable before the text runs out.";

    const excerpt = buildSearchExcerpt(text, ["gradient"]);
    expect(excerpt).toMatch(/^…\S/);
    expect(excerpt).toMatch(/\S…$/);
    expect(excerpt).toContain("gradient descent");
    // Starts and ends on whole words.
    expect(text).toContain(excerpt.slice(1, -1));
    expect(text[text.indexOf(excerpt.slice(1, -1)) - 1]).toBe(" ");
    expect(buildSearchExcerpt("Short content", ["missing"])).toBe(
      "Short content"
    );
  });

  it("highlights terms in escaped HTML", () => {
    expect(highlightSearchTerms("RAG <b> & rag", ["rag"])).toBe(
      "<mark>RAG</mark> &lt;b&gt; &amp; <mark>rag</mark>"
    );
    expect(highlightSearchTerms("a.b (c)", ["a.b", "(c"])).toBe(
      "<mark>a.b</mark> <mark>(c</mark>)"
    );
    expect(highlightSearchTerms("检索系统", ["检索"])).toBe(
      "<mark>检索</mark>系统"
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

  it("keeps hyphenated words and dollar amounts in the index", () => {
    expect(
      stripMarkdown("- LLM-as-judge costs $5 to $10 --- see $k$ and $$\\sum$$")
    ).toBe("LLM-as-judge costs $5 to $10 see and");
  });
});

describe("post details", () => {
  it("formats content dates in UTC", () => {
    const date = new Date("2026-03-07T00:30:00-08:00");
    expect(formatDate(date)).toBe("7 Mar 2026");
    expect(formatDate(new Date("2026-09-30"))).toBe("30 Sep 2026");
    expect(getYear(new Date("2026-01-01T00:00:00Z"))).toBe("2026");
    expect(
      isSameDay(
        new Date("2026-03-07T01:00:00Z"),
        new Date("2026-03-07T23:00:00Z")
      )
    ).toBe(true);
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
    expect(getBreadcrumbList("/posts/")).toEqual(["Posts"]);
    expect(getBreadcrumbList("/posts/2/")).toEqual(["Posts (page 2)"]);
    expect(getBreadcrumbList("/tags/machine-learning/")).toEqual([
      "tags",
      "machine-learning",
    ]);
    expect(getBreadcrumbList("/tags/machine-learning/2/")).toEqual([
      "tags",
      "machine-learning (page 2)",
    ]);
  });
});

describe("code block file names", () => {
  const render = (meta: string) =>
    codeToHtml("const x = 1;", {
      lang: "ts",
      theme: "min-light",
      meta: { __raw: meta },
      transformers: [transformerFileName()],
    });

  it("labels a block from its file meta", async () => {
    const html = await render('file="src/config.ts" {1}');
    expect(html).toContain(">src/config.ts</span>");
    expect(html).toContain("--file-name-offset: -0.75rem;");
  });

  it("leaves blocks without a file name unlabeled", async () => {
    expect(await render("{1}")).not.toContain("left-2");
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
