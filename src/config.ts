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
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  dynamicOgImage: false,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // default html lang code
  supportedLangs: ["en", "zh-CN"],
  timezone: "America/Los_Angeles", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
