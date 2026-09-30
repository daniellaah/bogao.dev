import { beforeEach, describe, expect, it, vi } from "vitest";

const collections = vi.hoisted(() => ({
  blog: [] as unknown[],
  projects: [] as unknown[],
}));

vi.mock("astro:content", () => ({
  getCollection: async (
    name: keyof typeof collections,
    filter?: (entry: unknown) => boolean
  ) => (filter ? collections[name].filter(filter) : collections[name]),
}));

const blogPost = (slug: string, pubDatetime: string, extra = {}) => ({
  id: slug,
  filePath: `src/content/blog/${slug}.md`,
  body: `## ${slug}\n\nBody with [a link](/x) and \`code\`.`,
  data: {
    slug,
    title: slug.toUpperCase(),
    description: `${slug} description`,
    pubDatetime: new Date(pubDatetime),
    draft: false,
    tags: ["Retrieval"],
    ...extra,
  },
});

beforeEach(() => {
  vi.stubEnv("DEV", false);
  collections.blog = [
    blogPost("older", "2024-01-01T00:00:00.000Z"),
    blogPost("newer", "2024-02-01T00:00:00.000Z"),
    blogPost("draft", "2024-03-01T00:00:00.000Z", { draft: true }),
  ];
  collections.projects = [
    {
      id: "arkb",
      body: "Project **body**",
      data: {
        title: "Agentic RAG",
        description: "Agent-controlled retrieval",
        status: "active",
        year: 2026,
        stack: ["Python"],
        draft: false,
      },
    },
    {
      id: "hidden",
      body: "",
      data: { title: "Hidden", description: "", stack: [], draft: true },
    },
  ];
});

describe("rss.xml", () => {
  it("lists published posts, newest first, with their dates", async () => {
    const { GET } = await import("@/pages/rss.xml");
    const xml = await (await GET()).text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
      ([, item]) => ({
        link: item.match(/<link>(.*?)<\/link>/)?.[1],
        pubDate: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1],
      })
    );

    expect(items).toEqual([
      {
        link: "https://bogao.dev/posts/newer/",
        pubDate: "Thu, 01 Feb 2024 00:00:00 GMT",
      },
      {
        link: "https://bogao.dev/posts/older/",
        pubDate: "Mon, 01 Jan 2024 00:00:00 GMT",
      },
    ]);
  });
});

describe("search-index.json", () => {
  it("indexes published posts, projects and tags", async () => {
    const { GET } = await import("@/pages/search-index.json");
    const response = await GET({} as never);
    const records = await response.json();

    expect(
      records.map(({ kind, url }: { kind: string; url: string }) => [kind, url])
    ).toEqual([
      ["Post", "/posts/newer"],
      ["Post", "/posts/older"],
      ["Project", "/projects/arkb"],
      ["Tag", "/tags/retrieval/"],
    ]);
    expect(records[0].content).toBe("newer Body with a link and .");
    expect(records[2]).toMatchObject({
      metaText: "active 2026 Python",
      content: "Project body",
    });
    expect(records[3].description).toBe("2 items tagged with #Retrieval");
  });
});
