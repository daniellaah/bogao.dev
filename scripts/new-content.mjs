#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

const ROOT = process.cwd();
const CONTENT_DIRS = {
  post: "src/content/blog",
  note: "src/content/notes",
  project: "src/content/projects",
};
const TEMPLATE_FILES = {
  post: {
    en: "templates/blog-post.en.md",
    "zh-CN": "templates/blog-post.zh-CN.md",
  },
  note: "templates/note.md",
  project: "templates/project.md",
};
const SUPPORTED_LANGS = ["en", "zh-CN"];
const PROJECT_STATUSES = ["active", "shipping", "archived", "lab"];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hasNonLatin = value => /[^\x00-\x7F]/.test(value);

const slugifyForContent = value => {
  const raw = hasNonLatin(value)
    ? kebabcase(value)
    : slugify(value, { lower: true });
  return raw.replace(/^[-.\s]+|[-.\s]+$/g, "") || "untitled";
};

const quoteYaml = value =>
  `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

const asList = value =>
  String(value ?? "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

const normalizeLang = value => {
  const lang = value ?? "en";
  if (!SUPPORTED_LANGS.includes(lang)) {
    throw new Error(
      `Unsupported lang "${lang}". Use ${SUPPORTED_LANGS.join(", ")}.`
    );
  }

  return lang;
};

const parseArgs = argv => {
  const values = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.trim();
    if (!key) continue;

    if (inlineValue !== undefined) {
      values[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      values[key] = next;
      index += 1;
    } else {
      values[key] = true;
    }
  }

  return { values, positional };
};

const usage = () => {
  console.log(`Usage:
  npm run new:post -- "Post title" [--lang en|zh-CN] [--date YYYY-MM-DD] [--tags tag1,tag2] [--slug custom-slug]
  npm run new:note -- "Note title" [--date YYYY-MM-DD] [--location "Los Angeles"] [--tags running,life] [--photos /images/notes/photo.webp]
  npm run new:project -- "Project title" [--status active|shipping|archived|lab] [--startDate YYYY-MM-DD] [--stack Python,Astro] [--repoUrl https://github.com/...]
`);
};

const readTemplateBody = templateFile => {
  const template = fs.readFileSync(path.join(ROOT, templateFile), "utf8");
  const match = template.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match?.[1]?.trimStart() ?? "";
};

const writeFile = (relativeFile, content) => {
  const file = path.join(ROOT, relativeFile);
  if (fs.existsSync(file)) {
    throw new Error(`Refusing to overwrite existing file: ${relativeFile}`);
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return relativeFile;
};

const yamlList = items =>
  items.map(item => `  - ${quoteYaml(item)}`).join("\n");

const yamlArrayField = (key, items) =>
  items.length > 0 ? `${key}:\n${yamlList(items)}` : `${key}: []`;

const makePost = options => {
  const lang = normalizeLang(options.lang);
  const date = options.date ?? today();
  const slug = slugifyForContent(options.slug ?? options.title);
  const filename = `${date}-${slug}.md`;
  const tags = asList(options.tags).length ? asList(options.tags) : ["notes"];
  const templateBody = readTemplateBody(TEMPLATE_FILES.post[lang]);

  return {
    file: `${CONTENT_DIRS.post}/${filename}`,
    content: `---
author: Bo
pubDatetime: ${date}
modDatetime: ${date}
title: ${quoteYaml(options.title)}
slug: ${quoteYaml(slug)}
draft: true
${yamlArrayField("tags", tags)}
lang: ${quoteYaml(lang)}
description: ${quoteYaml(options.description ?? `Draft post about ${options.title}.`)}
---

${templateBody}
`,
  };
};

const makeNote = options => {
  const lang = normalizeLang(options.lang);
  const date = options.date ?? today();
  const slug = slugifyForContent(options.slug ?? `${date}-${options.title}`);
  const filename = `${slug}.md`;
  const tags = asList(options.tags).length ? asList(options.tags) : ["notes"];
  const photos = asList(options.photos);
  const templateBody = readTemplateBody(TEMPLATE_FILES.note);

  return {
    file: `${CONTENT_DIRS.note}/${filename}`,
    content: `---
title: ${quoteYaml(options.title)}
slug: ${quoteYaml(slug)}
description: ${quoteYaml(options.description ?? `Draft note about ${options.title}.`)}
noteDate: ${date}
modDatetime:
draft: true
lang: ${quoteYaml(lang)}
${options.location ? `location: ${quoteYaml(options.location)}\n` : ""}${yamlArrayField("tags", tags)}
${yamlArrayField("photos", photos)}
---

${templateBody}
`,
  };
};

const makeProject = options => {
  const lang = normalizeLang(options.lang);
  const status = options.status ?? "active";
  if (!PROJECT_STATUSES.includes(status)) {
    throw new Error(
      `Unsupported status "${status}". Use ${PROJECT_STATUSES.join(", ")}.`
    );
  }

  const startDate = options.startDate ?? options.date ?? today();
  const slug = slugifyForContent(options.slug ?? options.title);
  const stack = asList(options.stack);
  const templateBody = readTemplateBody(TEMPLATE_FILES.project);
  const year = Number(options.year ?? startDate.slice(0, 4));

  return {
    file: `${CONTENT_DIRS.project}/${slug}.md`,
    content: `---
title: ${quoteYaml(options.title)}
description: ${quoteYaml(options.description ?? `A short description of ${options.title}.`)}
status: ${quoteYaml(status)}
order: -1
startDate: ${startDate}
featured: false
draft: true
lang: ${quoteYaml(lang)}
year: ${year}
${yamlArrayField("stack", stack)}
${options.demoUrl ? `demoUrl: ${quoteYaml(options.demoUrl)}\n` : ""}${options.repoUrl ? `repoUrl: ${quoteYaml(options.repoUrl)}\n` : ""}---

${templateBody}
`,
  };
};

const main = () => {
  const [kind, ...rest] = process.argv.slice(2);

  if (!CONTENT_DIRS[kind]) {
    usage();
    process.exit(1);
  }

  const { values, positional } = parseArgs(rest);
  const title = values.title ?? positional.join(" ").trim();

  if (!title) {
    usage();
    process.exit(1);
  }

  const options = { ...values, title };
  const draft =
    kind === "post"
      ? makePost(options)
      : kind === "note"
        ? makeNote(options)
        : makeProject(options);

  const file = writeFile(draft.file, draft.content);
  console.log(`Created ${file}`);
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
