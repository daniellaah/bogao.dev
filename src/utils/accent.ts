export const ACCENTS = ["yellow", "blue", "pink", "green"] as const;

export type Accent = (typeof ACCENTS)[number];

// A project keeps the same marker color on every card and on its own page,
// assigned by its position in the canonical sorted project list.
export const getProjectAccent = (
  id: string,
  sortedIds: readonly string[]
): Accent => ACCENTS[Math.max(0, sortedIds.indexOf(id)) % ACCENTS.length];
