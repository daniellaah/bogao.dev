import type { APIRoute } from "astro";
import { getPostPath, getPosts } from "@/utils/posts";
import { getProjectPath, getProjects } from "@/utils/projects";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { collectTagStats, getTagPath } from "@/utils/tags";
import searchKinds from "@/data/search-kinds.json";

const SEARCH_RECORD_KINDS = Object.fromEntries(
  searchKinds
    .filter(kind => kind.recordKind)
    .map(kind => [kind.filter, kind.recordKind])
) as {
  posts: "Post";
  projects: "Project";
  tags: "Tag";
};

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const projects = await getProjects();
  const tags = collectTagStats(posts);

  const records = [
    ...posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      url: getPostPath(post),
      kind: SEARCH_RECORD_KINDS.posts,
      metaText: post.data.tags.join(" "),
      content: stripMarkdown(post.body ?? ""),
    })),
    ...projects.map(project => ({
      title: project.data.title,
      description: project.data.description,
      url: getProjectPath(project.id),
      kind: SEARCH_RECORD_KINDS.projects,
      metaText: [
        project.data.status,
        String(project.data.year ?? ""),
        ...project.data.stack,
      ].join(" "),
      content: stripMarkdown(project.body ?? ""),
    })),
    ...tags.map(tag => ({
      title: `#${tag.tagName}`,
      description: `${tag.count} post${tag.count === 1 ? "" : "s"} tagged #${tag.tagName}`,
      url: getTagPath(tag.slug),
      kind: SEARCH_RECORD_KINDS.tags,
      metaText: `${tag.tagName} ${tag.slug}`,
      content: "",
    })),
  ];

  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
