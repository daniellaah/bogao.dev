const trimTrailingSlash = (pathname: string) => pathname.replace(/\/+$/, "");

export function getBreadcrumbList(pathname: string) {
  const segments = trimTrailingSlash(pathname).split("/").slice(1);

  if (segments[0] === "posts" && segments[1] === "lang") {
    if (!Number.isNaN(Number(segments[3]))) {
      return [`Posts (page ${segments[3]})`];
    }

    return ["Posts"];
  }

  if (segments[0] === "posts") {
    return [`Posts (page ${segments[1] || 1})`];
  }

  if (segments[0] === "tags" && !Number.isNaN(Number(segments[2]))) {
    return [
      segments[0],
      `${segments[1]} ${Number(segments[2]) === 1 ? "" : "(page " + segments[2] + ")"}`,
    ];
  }

  return segments;
}
