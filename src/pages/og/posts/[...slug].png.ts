import type { APIRoute, GetStaticPaths } from "astro";
import { formatDate } from "@/utils/date";
import { renderOgImage } from "@/utils/og/render";
import { getPostPath, getPosts, type Post } from "@/utils/posts";
import { getReadingMinutes } from "@/utils/readingTime";

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map(post => ({
    params: { slug: getPostPath(post, false) },
    props: { post },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post }> = async ({ props: { post } }) => {
  const { title, description, tags, pubDatetime } = post.data;
  const png = await renderOgImage({
    title,
    description,
    tags,
    meta: `${formatDate(pubDatetime)} · ${getReadingMinutes(post.body ?? "")} min read`,
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
