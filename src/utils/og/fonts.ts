import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import type { Font, FontWeight } from "satori";

// Fonts come from @fontsource packages: WOFF files split into unicode-range
// subsets, described by each package's unicode.json. Satori reads WOFF but
// not WOFF2, and the site's own fonts are system fonts or WOFF2.

type UnicodeRanges = Record<string, string>;

const require = createRequire(import.meta.url);

type FontFamily = {
  name: string;
  pkg: string;
  // File prefix, e.g. "noto-sans-sc" for "noto-sans-sc-119-700-normal.woff".
  prefix: string;
  weights: FontWeight[];
  // Load only the subsets the text needs (CJK fonts ship ~100 of them).
  onDemand: boolean;
};

// In fallback order: a glyph missing from the requested family comes from the
// first font here that has it.
const FAMILIES: FontFamily[] = [
  {
    name: "Figtree",
    pkg: "@fontsource/figtree",
    prefix: "figtree",
    weights: [500, 700],
    onDemand: false,
  },
  {
    name: "Noto Sans SC",
    pkg: "@fontsource/noto-sans-sc",
    prefix: "noto-sans-sc",
    weights: [500, 700],
    onDemand: true,
  },
  {
    name: "Handlee",
    pkg: "@fontsource/handlee",
    prefix: "handlee",
    weights: [400],
    onDemand: false,
  },
];

const ALWAYS_LOADED_SUBSETS = ["latin", "latin-ext"];

/** Parses a CSS unicode-range list, e.g. "U+0000-00FF,U+0131". */
export const parseUnicodeRange = (value: string): [number, number][] =>
  value.split(",").map(part => {
    const [start, end = start] = part.trim().replace(/^U\+/i, "").split("-");
    return [parseInt(start, 16), parseInt(end, 16)];
  });

/**
 * The subsets of a font that cover at least one character of `text`, by
 * file name segment: unicode.json keys like "[119]" become "119".
 */
export const subsetsForText = (ranges: UnicodeRanges, text: string) => {
  const codePoints = [...new Set(text)].map(char => char.codePointAt(0)!);

  return Object.entries(ranges)
    .filter(([, range]) =>
      parseUnicodeRange(range).some(([start, end]) =>
        codePoints.some(point => point >= start && point <= end)
      )
    )
    .map(([key]) => key.replace(/^\[(\d+)\]$/, "$1"));
};

const packageDir = (pkg: string) =>
  path.dirname(require.resolve(`${pkg}/package.json`));

const fileCache = new Map<string, Promise<Buffer>>();

const readCached = (file: string) => {
  let data = fileCache.get(file);
  if (!data) {
    data = readFile(file);
    fileCache.set(file, data);
  }
  return data;
};

/**
 * The fonts Satori needs to set `text`. Ask for "Figtree" or "Handlee";
 * other scripts fall back to Noto Sans SC.
 */
export const loadFonts = async (text: string): Promise<Font[]> => {
  const fonts = await Promise.all(
    FAMILIES.flatMap(family => {
      const dir = packageDir(family.pkg);
      const ranges: UnicodeRanges = require(`${family.pkg}/unicode.json`);
      const subsets = family.onDemand
        ? subsetsForText(ranges, text)
        : Object.keys(ranges).filter(key =>
            ALWAYS_LOADED_SUBSETS.includes(key)
          );

      return family.weights.flatMap(weight =>
        subsets.map(async subset => ({
          // Satori keeps one font per name and weight, so each subset gets
          // its own name; only the Latin one answers to the family name.
          name: subset === "latin" ? family.name : `${family.name} ${subset}`,
          weight,
          style: "normal" as const,
          data: await readCached(
            path.join(
              dir,
              "files",
              `${family.prefix}-${subset}-${weight}-normal.woff`
            )
          ),
        }))
      );
    })
  );

  return fonts;
};
