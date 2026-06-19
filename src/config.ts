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
  desc: "Bo's blog about machine learning notes, LLM workflows, and personal experiments.",
  title: "BoGao.Dev",
  ogImage: "og.png",
  postPerPage: 100,
  postFilterTags: [
    "Machine Learning",
    "Deep Learning",
    "CS229",
    "SVM",
    "Recommender Systems",
  ],
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // default html lang code
  supportedLangs: ["en", "zh-CN"],
} as const;
