import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const rulesPath = path.join(REPO_ROOT, "src/data/content-rules.json");

export const contentRules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));

export const COLLECTIONS = Object.entries(contentRules.collections).map(
  ([name, config]) => ({ name, dir: config.dir })
);

export const ALLOWED_FRONTMATTER_FIELDS = Object.fromEntries(
  Object.entries(contentRules.collections).map(([name, config]) => [
    name,
    new Set(config.frontmatterFields),
  ])
);

export const ALLOWED_OPTIONS = Object.fromEntries(
  Object.entries(contentRules.contentKinds).map(([kind, config]) => [
    kind,
    new Set(config.allowedOptions),
  ])
);

export const TEMPLATE_FILES = Object.fromEntries(
  Object.entries(contentRules.contentKinds).map(([kind, config]) => [
    kind,
    config.template,
  ])
);

export const PROJECT_STATUSES = contentRules.projectStatuses;

export const getContentDir = kind => {
  const collection = contentRules.contentKinds[kind]?.collection;
  return collection ? contentRules.collections[collection]?.dir : undefined;
};

const hasNonLatin = value => /[^\x00-\x7F]/.test(value);

export const stripMarkdownExt = value => value.replace(/\.(md|mdx)$/i, "");

export const slugifyForContent = (
  value,
  { stripMarkdownExt: shouldStripMarkdownExt = false } = {}
) => {
  const raw = hasNonLatin(value)
    ? kebabcase(value)
    : slugify(value, { lower: true });
  const slug = shouldStripMarkdownExt ? stripMarkdownExt(raw) : raw;
  return slug.replace(/^[-.\s]+|[-.\s]+$/g, "") || "untitled";
};
