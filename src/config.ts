const normalizeSiteUrl = (value?: string) => {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `https://${value}`;
};

const resolvedWebsite =
  normalizeSiteUrl(process.env.PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  "https://bogao.dev/";

export const SITE = {
  website: resolvedWebsite,
  author: "Bo Gao",
  profile: "https://github.com/daniellaah",
  linkedin: "https://www.linkedin.com/in/bogao223/",
  // Set to a public path (e.g. "/resume.pdf") to show a Résumé icon in the hero.
  resumeUrl: undefined as string | undefined,
  desc: "Bo Gao, AI / ML engineer: production retrieval and recommendation systems at 100M+ DAU scale, now agentic retrieval and LLM post-training.",
  title: "BoGao.Dev",
  ogImage: "og.png",
  postPerPage: 100,
  postPopularFilterTags: [
    "AI Agents",
    "Evaluation",
    "Retrieval",
    "LLM Systems",
    "Developer Tools",
  ],
  // Posts dated up to this far in the future still publish, so a build that
  // runs a little early includes them. Future posts appear on the next build
  // after their pubDatetime; see .github/workflows/rebuild.yml.
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showBackButton: true, // enable back links and stored return URLs
  lang: "en", // default <html lang>; posts can override it
  dir: "ltr", // "rtl" | "auto"
} as const;
