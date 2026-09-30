import { createSearchIndexLoader } from "../utils/search";

// One loader per full page load, shared by the command palette and the search
// page, so client-side navigation never refetches the index.
export const loadSearchIndex = createSearchIndexLoader();
