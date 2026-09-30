export type MergedPrSummary = {
  number: number;
  title: string;
  url: string;
  mergedAt: Date;
  total: number;
};

type SearchItem = {
  number: number;
  title: string;
  html_url: string;
  pull_request?: { merged_at?: string | null };
};

type SearchResponse = {
  total_count?: number;
  items?: SearchItem[];
};

const REQUEST_TIMEOUT_MS = 8000;

// One request per repo per build (and per dev-server session).
const cache = new Map<string, Promise<MergedPrSummary | undefined>>();

export const getMergedPrsUrl = (repo: string, author: string) =>
  `https://github.com/${repo}/pulls?q=${encodeURIComponent(
    `is:pr is:merged author:${author}`
  )}`;

// Search can't sort by merge date, so pick the latest merge client-side from
// the most recently updated PRs (merging updates a PR, so it is among them).
export const summarizeMergedPrs = (
  response: SearchResponse
): MergedPrSummary | undefined => {
  const latest = (response.items ?? [])
    .flatMap(item => {
      const mergedAt = item.pull_request?.merged_at;
      return mergedAt ? [{ item, mergedAt: new Date(mergedAt) }] : [];
    })
    .sort((a, b) => b.mergedAt.getTime() - a.mergedAt.getTime())[0];

  if (!latest) return undefined;

  return {
    number: latest.item.number,
    title: latest.item.title,
    url: latest.item.html_url,
    mergedAt: latest.mergedAt,
    total: response.total_count ?? 1,
  };
};

const fetchMergedPrs = async (repo: string, author: string) => {
  const query = `repo:${repo} is:pr is:merged author:${author}`;
  const token =
    typeof process === "undefined" ? undefined : process.env.GITHUB_TOKEN;

  try {
    const response = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=50`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
    return summarizeMergedPrs((await response.json()) as SearchResponse);
  } catch (error) {
    // The card falls back to its description; never fail the build over it,
    // but say so in the build log.
    // eslint-disable-next-line no-console
    console.warn(`[mergedPrs] ${repo}: ${(error as Error).message}`);
    cache.delete(`${repo}:${author}`);
    return undefined;
  }
};

export const getLatestMergedPr = (repo: string, author: string) => {
  const key = `${repo}:${author}`;
  let summary = cache.get(key);
  if (!summary) {
    summary = fetchMergedPrs(repo, author);
    cache.set(key, summary);
  }
  return summary;
};
