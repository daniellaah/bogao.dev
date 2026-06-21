import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

export type SiteLanguage = (typeof SITE.supportedLangs)[number];

const LANGUAGE_META: Record<
  SiteLanguage,
  { label: string; shortLabel: string; description: string; path: string }
> = {
  en: {
    label: "English",
    shortLabel: "EN",
    description: "Posts written in English.",
    path: "en",
  },
  "zh-CN": {
    label: "中文",
    shortLabel: "中文",
    description: "Posts written in Simplified Chinese.",
    path: "zh-cn",
  },
};

export function getLanguageMeta(lang: string) {
  return LANGUAGE_META[(lang as SiteLanguage) || SITE.lang] ?? LANGUAGE_META.en;
}

export function getLanguagePosts(
  posts: CollectionEntry<"blog">[],
  lang: SiteLanguage
) {
  return posts.filter(post => post.data.lang === lang);
}
