import GithubSlugger from "github-slugger";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type VFileLike = {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
};

const HEADING = /^h[1-6]$/;

const textOf = (node: HastNode): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("");

// Runs before rehype-katex. Astro collects heading text after every plugin,
// when KaTeX has already rendered `$k$` into three copies of "k" (MathML,
// annotation, HTML), so the TOC would read "What kkk controls". Here the math
// is still its source, so we fix the id and record the readable text, which
// the layouts read back through `remarkPluginFrontmatter.headingText`.
export default function rehypeHeadingText() {
  return (tree: HastNode, file: VFileLike) => {
    const slugger = new GithubSlugger();
    const headingText: Record<string, string> = {};

    const visit = (node: HastNode) => {
      if (node.type === "element" && HEADING.test(node.tagName ?? "")) {
        const text = textOf(node).trim();
        node.properties ??= {};
        if (typeof node.properties.id !== "string") {
          node.properties.id = slugger.slug(text).replace(/-$/, "");
        }
        headingText[node.properties.id as string] = text;
        return;
      }
      node.children?.forEach(visit);
    };
    visit(tree);

    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.headingText = headingText;
  };
}
