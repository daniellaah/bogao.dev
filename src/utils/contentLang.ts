import { SITE } from "@/config";

const HAN = /\p{Script=Han}/u;

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
};

type LangSource = { lang?: string; title: string; description: string };

/**
 * Language of a piece of content: the frontmatter `lang` when set, otherwise
 * Chinese when the title or description contains Han characters, otherwise the
 * site language.
 */
export const getContentLang = ({ lang, title, description }: LangSource) =>
  lang ?? (HAN.test(`${title}${description}`) ? "zh-CN" : SITE.lang);

/** `lang` attribute for content shown inside a page in the site language. */
export const getInlineLang = (source: LangSource) => {
  const lang = getContentLang(source);
  return lang === SITE.lang ? undefined : lang;
};

export const getOgLocale = (lang: string) =>
  OG_LOCALES[lang] ?? lang.replace("-", "_");
