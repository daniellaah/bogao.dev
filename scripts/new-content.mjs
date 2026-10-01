#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  CONTENT_KINDS,
  PROJECT_STATUSES,
  REPO_ROOT,
  slugifyForContent,
} from "./content-rules.mjs";

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
  for (const option of Object.keys(values)) {
    if (!CONTENT_KINDS[kind].allowedOptions.has(option)) {
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
};

const yamlArrayField = (key, items) =>
  items.length > 0
    ? `${key}:\n${items.map(item => `  - ${quoteYaml(item)}`).join("\n")}`
    : `${key}: []`;

const makePost = options => {
  const date = options.date ?? today();
  const slug = slugifyForContent(options.slug ?? options.title);
  const templateBody = readTemplateBody(CONTENT_KINDS.post.template);
  const description =
    options.description ?? `Draft post about ${options.title}.`;

  return {
    file: `${CONTENT_KINDS.post.dir}/${slug}.md`,
    content: `---
pubDatetime: ${date}
modDatetime: ${date}
title: ${quoteYaml(options.title)}
slug: ${quoteYaml(slug)}
draft: true
${yamlArrayField("tags", asList(options.tags))}
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
  const templateBody = readTemplateBody(CONTENT_KINDS.project.template);
  const year = Number(options.year ?? startDate.slice(0, 4));

  return {
    file: `${CONTENT_KINDS.project.dir}/${slug}.md`,
    content: `---
title: ${quoteYaml(options.title)}
description: ${quoteYaml(options.description ?? `A short description of ${options.title}.`)}
status: ${quoteYaml(status)}
order: -1
startDate: ${startDate}
featured: false
draft: true
year: ${year}
${yamlArrayField("stack", asList(options.stack))}
${options.demoUrl ? `demoUrl: ${quoteYaml(options.demoUrl)}\n` : ""}${options.repoUrl ? `repoUrl: ${quoteYaml(options.repoUrl)}\n` : ""}# role: "Solo: design, build and evaluation"
# metrics:
#   - value: "+12%"
#     label: "nDCG@10 over BM25"
# cover:
#   src: "./images/${slug}-architecture.png"
#   alt: "Architecture diagram of ${options.title}"
---

${templateBody}
`,
  };
};

const main = () => {
  const [kind, ...rest] = process.argv.slice(2);

  if (!Object.hasOwn(CONTENT_KINDS, kind)) {
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

  writeFile(draft.file, draft.content);
  console.log(`Created ${draft.file}`);
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
