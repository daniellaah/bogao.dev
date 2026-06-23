#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  ALLOWED_OPTIONS,
  PROJECT_STATUSES,
  REPO_ROOT,
  TEMPLATE_FILES,
  getContentDir,
  slugifyForContent,
} from "./content-rules.mjs";

const DEFAULT_CONTENT_TAGS = [];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const quoteYaml = value =>
  `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

const asList = value =>
  String(value ?? "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

const asListWithDefault = (value, defaultItems) => {
  const items = asList(value);
  return items.length > 0 ? items : defaultItems;
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

const validateKnownOptions = (kind, values) => {
  const allowedOptions = ALLOWED_OPTIONS[kind];

  for (const option of Object.keys(values)) {
    if (!allowedOptions.has(option)) {
      throw new Error(`Unsupported option for ${kind}: --${option}`);
    }
  }
};

const usage = () => {
  console.log(`Usage:
  npm run new:post -- "Post title" [--date YYYY-MM-DD] [--tags tag1,tag2] [--slug custom-slug]
  npm run new:project -- "Project title" [--status ${PROJECT_STATUSES.join("|")}] [--startDate YYYY-MM-DD] [--stack Python,Astro] [--repoUrl https://github.com/...]
`);
};

const readTemplateBody = templateFile => {
  const template = fs.readFileSync(path.join(REPO_ROOT, templateFile), "utf8");
  const match = template.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match?.[1]?.trimStart() ?? "";
};

const writeFile = (relativeFile, content) => {
  const file = path.join(REPO_ROOT, relativeFile);
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
  const date = options.date ?? today();
  const slug = slugifyForContent(options.slug ?? options.title);
  const filename = `${slug}.md`;
  const tags = asListWithDefault(options.tags, DEFAULT_CONTENT_TAGS);
  const templateBody = readTemplateBody(TEMPLATE_FILES.post);
  const description =
    options.description ?? `Draft post about ${options.title}.`;

  return {
    file: `${getContentDir("post")}/${filename}`,
    content: `---
author: Bo
pubDatetime: ${date}
modDatetime: ${date}
title: ${quoteYaml(options.title)}
slug: ${quoteYaml(slug)}
draft: true
${yamlArrayField("tags", tags)}
description: ${quoteYaml(description)}
---

${templateBody}
`,
  };
};

const makeProject = options => {
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
    file: `${getContentDir("project")}/${slug}.md`,
    content: `---
title: ${quoteYaml(options.title)}
description: ${quoteYaml(options.description ?? `A short description of ${options.title}.`)}
status: ${quoteYaml(status)}
order: -1
startDate: ${startDate}
featured: false
draft: true
year: ${year}
${yamlArrayField("stack", stack)}
${options.demoUrl ? `demoUrl: ${quoteYaml(options.demoUrl)}\n` : ""}${options.repoUrl ? `repoUrl: ${quoteYaml(options.repoUrl)}\n` : ""}---

${templateBody}
`,
  };
};

const main = () => {
  const [kind, ...rest] = process.argv.slice(2);

  if (!getContentDir(kind)) {
    usage();
    process.exit(1);
  }

  const { values, positional } = parseArgs(rest);
  validateKnownOptions(kind, values);
  const title = values.title ?? positional.join(" ").trim();

  if (!title) {
    usage();
    process.exit(1);
  }

  const options = { ...values, title };
  const draft = kind === "post" ? makePost(options) : makeProject(options);

  const file = writeFile(draft.file, draft.content);
  console.log(`Created ${file}`);
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
