import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getProjectPath } from "@/utils/getProjectPath";
import { getNotePath } from "@/utils/getNotePath";
import { getPostPath } from "@/utils/getPostPath";
import getSortedPosts from "@/utils/getSortedPosts";
import getUniqueTags from "@/utils/getUniqueTags";
import { isPublishedNote } from "@/utils/noteVisibility";
import searchKinds from "@/data/search-kinds.json";

const SEARCH_RECORD_KINDS = Object.fromEntries(
  searchKinds
    .filter(kind => kind.recordKind)
    .map(kind => [kind.filter, kind.recordKind])
) as {
  posts: "Post";
  projects: "Project";
  notes: "Note";
  tags: "Tag";
};

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\$+[\s\S]*?\$+/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const GET: APIRoute = async () => {
  const blogEntries = await getCollection("blog");
  const posts = getSortedPosts(blogEntries);
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  const notes = await getCollection("notes", isPublishedNote);
  const tags = getUniqueTags([...posts, ...notes]);

  const records = [
    ...posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      url: getPostPath(post),
      kind: SEARCH_RECORD_KINDS.posts,
      metaText: post.data.tags.join(" "),
      content: stripMarkdown(post.body),
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
      content: stripMarkdown(project.body),
    })),
    ...notes.map(note => ({
      title:
        note.data.title ??
        new Date(note.data.noteDate).toISOString().slice(0, 10),
      description: note.data.description,
      url: getNotePath(note.id, note.slug),
      kind: SEARCH_RECORD_KINDS.notes,
      metaText: [note.data.location ?? "", ...note.data.tags].join(" "),
      content: stripMarkdown(note.body),
    })),
    ...tags.map(tag => ({
      title: `#${tag.tagName}`,
      description: `${tag.count} item${tag.count === 1 ? "" : "s"} tagged with #${tag.tagName}`,
      url: `/tags/${tag.tag}/`,
      kind: SEARCH_RECORD_KINDS.tags,
      metaText: `${tag.tagName} ${tag.tag}`,
      content: tag.tagName,
    })),
  ];

  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
