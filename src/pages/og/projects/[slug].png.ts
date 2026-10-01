import type { APIRoute, GetStaticPaths } from "astro";
import { renderOgImage } from "@/utils/og/render";
import { getProjects, getProjectSlug, type Project } from "@/utils/projects";

export const getStaticPaths = (async () => {
  const projects = await getProjects();
  return projects.map(project => ({
    params: { slug: getProjectSlug(project.id) },
    props: { project },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ project: Project }> = async ({
  props: { project },
}) => {
  const { title, description, tags, kicker, year } = project.data;
  const png = await renderOgImage({
    title,
    description,
    tags,
    meta: [kicker ?? "Project", year].filter(Boolean).join(" · "),
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
