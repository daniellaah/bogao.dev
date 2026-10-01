import type { APIRoute } from "astro";
import { getPostPath, getPosts } from "@/utils/posts";
import { getProjectPath, getProjects } from "@/utils/projects";
import { stripMarkdown } from "@/utils/stripMarkdown";
import type { SearchRecord } from "@/utils/search";
import { collectTagStats, getTagPath } from "@/utils/tags";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const projects = await getProjects();
  const tags = collectTagStats(posts);

  const records = [
    ...posts.map(
      (post): SearchRecord => ({
        title: post.data.title,
        description: post.data.description,
        url: getPostPath(post),
        kind: "Post",
        metaText: post.data.tags.join(" "),
        content: stripMarkdown(post.body ?? ""),
      })
    ),
    ...projects.map(
      (project): SearchRecord => ({
        title: project.data.title,
        description: project.data.description,
        url: getProjectPath(project.id),
        kind: "Project",
        metaText: [
          project.data.status,
          String(project.data.year ?? ""),
          ...project.data.stack,
        ].join(" "),
        content: stripMarkdown(project.body ?? ""),
      })
    ),
    ...tags.map(
      (tag): SearchRecord => ({
        title: `#${tag.tagName}`,
        description: `${tag.count} post${tag.count === 1 ? "" : "s"} tagged #${tag.tagName}`,
        url: getTagPath(tag.slug),
        kind: "Tag",
        metaText: `${tag.tagName} ${tag.slug}`,
        content: "",
      })
    ),
  ];

  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
