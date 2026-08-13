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
  author: "Bo",
  profile: "https://github.com/daniellaah",
  linkedin: "https://www.linkedin.com/in/bogao223/",
  desc: "Bo's portfolio and writing on AI agents, evaluation, retrieval, developer tools, and applied AI systems.",
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
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // enable back links and stored return URLs
  dir: "ltr", // "rtl" | "auto"
} as const;
