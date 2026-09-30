/**
 * Shiki transformer that labels a code block with its file name, taken from
 * the `file="name"` meta attribute: ```ts file="src/config.ts"
 *
 * Every <pre> gets `--file-name-offset`, which the copy button in
 * postDetails.ts uses to sit level with the label.
 */
export const transformerFileName = () => ({
  pre(node) {
    node.properties.style =
      (node.properties.style || "") + "--file-name-offset: -0.75rem;";

    const file = this.options.meta?.__raw?.match(
      /(?:^|\s)file=["'`]?([^"'`\s]+)/
    )?.[1];
    if (!file) return;

    this.addClassToHast(node, "mt-8");
    node.children.push({
      type: "element",
      tagName: "span",
      properties: {
        class: [
          "absolute py-1 text-foreground text-xs font-medium leading-4",
          "pl-4 pr-2 before:inline-block before:size-1 before:bg-foreground before:rounded-full before:absolute before:top-[45%] before:left-2",
          "left-2 top-(--file-name-offset) border bg-background",
        ],
      },
      children: [{ type: "text", value: file }],
    });
  },
});
