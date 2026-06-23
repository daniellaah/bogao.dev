#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  ALLOWED_FRONTMATTER_FIELDS,
  COLLECTIONS,
  PROJECT_STATUSES,
  REPO_ROOT,
  slugifyForContent,
  stripMarkdownExt,
} from "./content-rules.mjs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];
const warnings = [];

const listMarkdownFiles = dir => {
  const absoluteDir = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(dir, entry.name);

    if (entry.isDirectory()) return listMarkdownFiles(relative);
    if (/\.(md|mdx)$/i.test(entry.name)) return [relative];
    return [];
  });
};

const parseScalar = value => {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "[]") return [];
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

export const parseFrontmatter = (file, source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    errors.push(`${file}: missing YAML frontmatter`);
    return { data: {}, raw: {} };
  }

  const data = {};
  const raw = {};
  let currentKey = null;

  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const arrayItem = line.match(/^\s+-\s*(.*)$/);
    if (arrayItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(arrayItem[1]));
      continue;
    }

    const field = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!field) continue;

    const [, key, value] = field;
    currentKey = key;
    raw[key] = value.trim();
    data[key] = parseScalar(value);
  }

  return { data, raw };
};

const isPresent = value =>
  value !== undefined && value !== null && String(value).trim() !== "";

const requireFields = (file, data, fields) => {
  for (const field of fields) {
    if (!isPresent(data[field])) errors.push(`${file}: missing ${field}`);
  }
};

const validateKnownFields = (file, collection, data) => {
  const allowedFields = ALLOWED_FRONTMATTER_FIELDS[collection];

  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) {
      errors.push(`${file}: unknown frontmatter field ${field}`);
    }
  }
};

const validateDate = (file, raw, field, required = false) => {
  const value = raw[field];
  if (!isPresent(value)) {
    if (required) errors.push(`${file}: missing ${field}`);
    return;
  }

  const unquoted = String(value).replace(/^['"]|['"]$/g, "");
  if (!DATE_PATTERN.test(unquoted)) {
    errors.push(`${file}: ${field} must use YYYY-MM-DD`);
  }
};

const validateStringArray = (file, data, field, required = false) => {
  const value = data[field];
  if (!Array.isArray(value)) {
    if (required) errors.push(`${file}: ${field} must be a YAML array`);
    return [];
  }

  const invalidItems = value.filter(item => !isPresent(item));
  if (invalidItems.length > 0) {
    errors.push(`${file}: ${field} contains empty values`);
  }

  return value.filter(isPresent).map(String);
};

const addSlug = (seenSlugs, collection, file, explicitSlug) => {
  const fileSlug = stripMarkdownExt(path.basename(file));
  const slug = slugifyForContent(explicitSlug || fileSlug, {
    stripMarkdownExt: true,
  });
  const duplicate = seenSlugs.get(slug);

  if (duplicate) {
    errors.push(
      `${file}: duplicate ${collection} slug "${slug}" also used by ${duplicate}`
    );
  } else {
    seenSlugs.set(slug, file);
  }
};

const warnImplicitSlug = (file, data) => {
  if (!isPresent(data.slug)) {
    warnings.push(`${file}: add an explicit slug to keep the URL stable`);
  }
};

const validateUrl = (file, data, field) => {
  const value = data[field];
  if (!isPresent(value)) return;

  try {
    new URL(String(value));
  } catch {
    errors.push(`${file}: ${field} must be a valid absolute URL`);
  }
};

const validateBlog = (file, data, raw, seenSlugs) => {
  requireFields(file, data, ["pubDatetime", "title", "description"]);
  validateDate(file, raw, "pubDatetime", true);
  validateDate(file, raw, "modDatetime");
  validateStringArray(file, data, "tags", true);
  addSlug(seenSlugs, "blog", file, data.slug);
  warnImplicitSlug(file, data);
};

const validateProject = (file, data, raw, seenSlugs) => {
  requireFields(file, data, ["title", "description", "status", "order"]);
  validateDate(file, raw, "startDate");
  validateStringArray(file, data, "stack");
  validateUrl(file, data, "demoUrl");
  validateUrl(file, data, "repoUrl");
  addSlug(seenSlugs, "project", file);

  if (isPresent(data.slug)) {
    errors.push(`${file}: project slug is derived from the filename`);
  }

  if (!PROJECT_STATUSES.includes(data.status)) {
    errors.push(
      `${file}: status must be one of ${PROJECT_STATUSES.join(", ")}`
    );
  }

  if (!Number.isInteger(data.order)) {
    errors.push(`${file}: order must be an integer`);
  }

  if (data.order === -1 && !isPresent(data.startDate)) {
    errors.push(`${file}: startDate is required when order is -1`);
  }

  if (isPresent(data.year) && !Number.isInteger(data.year)) {
    errors.push(`${file}: year must be an integer`);
  }
};

const main = () => {
  for (const collection of COLLECTIONS) {
    const seenSlugs = new Map();
    const files = listMarkdownFiles(collection.dir);

    for (const file of files) {
      const source = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
      const { data, raw } = parseFrontmatter(file, source);

      validateKnownFields(file, collection.name, data);

      if (collection.name === "blog") validateBlog(file, data, raw, seenSlugs);
      if (collection.name === "projects") {
        validateProject(file, data, raw, seenSlugs);
      }
    }
  }

  for (const warning of warnings) console.warn(`Warning: ${warning}`);

  if (errors.length > 0) {
    for (const error of errors) console.error(`Error: ${error}`);
    process.exit(1);
  }

  console.log("Content check passed.");
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
