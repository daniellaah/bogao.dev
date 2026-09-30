// Path segments shown in the breadcrumb; paginated lists name their page.
export function getBreadcrumbList(pathname: string) {
  const segments = pathname.replace(/\/+$/, "").split("/").slice(1);
  const [section, first, second] = segments;

  if (section === "posts") {
    return [first ? `Posts (page ${first})` : "Posts"];
  }

  if (section === "tags" && second) {
    return [section, `${first} (page ${second})`];
  }

  return segments;
}
