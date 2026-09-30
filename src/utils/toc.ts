import type { MarkdownHeading } from "astro";

type TocOptions = {
  depths?: readonly number[];
  limit?: number;
};

// Headings for a table of contents, using the readable text recorded by
// rehypeHeadingText (math as source) when it is available.
export const getTocHeadings = (
  headings: MarkdownHeading[],
  headingText: Record<string, string> | undefined,
  { depths = [2, 3, 4], limit = 12 }: TocOptions = {}
): MarkdownHeading[] =>
  headings
    .filter(heading => depths.includes(heading.depth))
    .slice(0, limit)
    .map(heading => ({
      ...heading,
      text: headingText?.[heading.slug] ?? heading.text,
    }));
