#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";
import {
  COLLECTIONS,
  PROJECT_STATUSES,
  REPO_ROOT,
  slugifyForContent,
  stripMarkdownExt,
} from "./content-rules.mjs";

// A date, or a date and time with an explicit zone so scheduled posts go
// live at the same moment whatever the build machine's time zone.
const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2}))?$/;

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

export const parseFrontmatter = (file, source) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push(`${file}: missing YAML frontmatter`);
    return {};
  }

  try {
    const data = parse(match[1]);
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    errors.push(`${file}: frontmatter must be a YAML mapping`);
  } catch (error) {
    errors.push(`${file}: invalid YAML frontmatter (${error.message})`);
  }
  return {};
};

const isPresent = value =>
  value !== undefined && value !== null && String(value).trim() !== "";

const requireFields = (file, data, fields) => {
  for (const field of fields) {
    if (!isPresent(data[field])) errors.push(`${file}: missing ${field}`);
  }
};

const validateKnownFields = (file, allowedFields, data) => {
  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) {
      errors.push(`${file}: unknown frontmatter field ${field}`);
    }
  }
};

const validateDate = (file, data, field) => {
  const value = data[field];
  if (isPresent(value) && !DATE_PATTERN.test(String(value))) {
    errors.push(
      `${file}: ${field} must be YYYY-MM-DD or YYYY-MM-DDTHH:mm with a zone (Z or +08:00)`
    );
  }
};

const validateStringArray = (file, data, field, required = false) => {
  const value = data[field];
  if (!Array.isArray(value)) {
    if (required) errors.push(`${file}: ${field} must be a YAML array`);
  } else if (!value.every(isPresent)) {
    errors.push(`${file}: ${field} contains empty values`);
  }
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

const validateUrl = (file, data, field) => {
  const value = data[field];
  if (!isPresent(value)) return;

  try {
    new URL(String(value));
  } catch {
    errors.push(`${file}: ${field} must be a valid absolute URL`);
  }
};

const validateBlog = (file, data, seenSlugs) => {
  requireFields(file, data, ["pubDatetime", "title", "description"]);
  validateDate(file, data, "pubDatetime");
  validateDate(file, data, "modDatetime");
  validateStringArray(file, data, "tags", true);
  addSlug(seenSlugs, "blog", file, data.slug);

  if (!isPresent(data.slug)) {
    warnings.push(`${file}: add an explicit slug to keep the URL stable`);
  }
};

const validateMetrics = (file, data) => {
  const { metrics } = data;
  if (metrics == null) return;
  if (!Array.isArray(metrics)) {
    errors.push(`${file}: metrics must be a YAML array`);
    return;
  }

  if (metrics.length > 4) {
    errors.push(`${file}: metrics allows at most 4 entries`);
  }
  metrics.forEach((metric, index) => {
    if (!isPresent(metric?.value) || !isPresent(metric?.label)) {
      errors.push(`${file}: metrics[${index}] needs a value and a label`);
    }
  });
};

const validateProject = (file, data, seenSlugs) => {
  requireFields(file, data, ["title", "description", "status", "order"]);
  validateDate(file, data, "startDate");
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

  validateMetrics(file, data);

  if (
    data.cover != null &&
    (!isPresent(data.cover.src) || !isPresent(data.cover.alt))
  ) {
    errors.push(`${file}: cover needs a src and alt text`);
  }
};

const VALIDATORS = { blog: validateBlog, projects: validateProject };

const main = () => {
  for (const { name, dir, fields } of COLLECTIONS) {
    const seenSlugs = new Map();

    for (const file of listMarkdownFiles(dir)) {
      const source = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
      const data = parseFrontmatter(file, source);

      validateKnownFields(file, fields, data);
      VALIDATORS[name]?.(file, data, seenSlugs);
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
