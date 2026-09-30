import rss from "@astrojs/rss";
import { getPostPath, getPosts } from "@/utils/posts";
import { SITE } from "@/config";

export async function GET() {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: posts.map(post => ({
      link: getPostPath(post),
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDatetime,
    })),
  });
}
