import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import { getProjectPath } from "@/utils/getProjectPath";
import { getNotePath } from "@/utils/getNotePath";

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
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  const notes = await getCollection("notes", ({ data }) => !data.draft);

  const records = [
    ...posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      url: getPath(post.id, post.filePath),
      kind: "Post",
      lang: post.data.lang,
      metaText: post.data.tags.join(" "),
      content: stripMarkdown(post.body),
    })),
    ...projects.map(project => ({
      title: project.data.title,
      description: project.data.description,
      url: getProjectPath(project.id),
      kind: "Project",
      lang: project.data.lang,
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
      url: getNotePath(note.id),
      kind: "Note",
      lang: note.data.lang,
      metaText: [
        note.data.kind,
        note.data.location ?? "",
        note.data.mood ?? "",
        ...note.data.tags,
      ].join(" "),
      content: stripMarkdown(note.body),
    })),
  ];

  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
