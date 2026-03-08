import { slugifyStr } from "./slugify";

export function getNotePath(id: string) {
  const slug = id
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/\.(md|mdx)$/i, "");

  return `/notes/${slugifyStr(slug ?? id)}`;
}
