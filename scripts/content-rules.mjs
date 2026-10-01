import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export {
  slugifyForContent,
  stripMarkdownExt,
} from "../src/utils/slugifyCore.js";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const rules = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "src/data/content-rules.json"), "utf8")
);

/** Content collections: where their files live and the frontmatter they allow. */
export const COLLECTIONS = Object.entries(rules.collections).map(
  ([name, { dir, frontmatterFields }]) => ({
    name,
    dir,
    fields: new Set(frontmatterFields),
  })
);

/** What `new-content.mjs` can create ("post", "project") and how. */
export const CONTENT_KINDS = Object.fromEntries(
  Object.entries(rules.contentKinds).map(
    ([kind, { collection, template, allowedOptions }]) => [
      kind,
      {
        dir: rules.collections[collection].dir,
        template,
        allowedOptions: new Set(allowedOptions),
      },
    ]
  )
);

export const PROJECT_STATUSES = rules.projectStatuses;
