type MdastNode = {
  type: string;
  value?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
};

export const CALLOUT_TYPES = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

// "[!NOTE]" opens the blockquote, optionally followed by a custom title on the
// same line: "> [!TIP] Try this first".
const MARKER = /^\[!(note|tip|important|warning|caution)\][ \t]*([^\n]*)\n?/i;

/** The callout type and remaining text, if `text` opens with a marker. */
export const parseCalloutMarker = (text: string) => {
  const match = MARKER.exec(text);
  if (!match) return undefined;
  const type = match[1].toLowerCase() as keyof typeof CALLOUT_TYPES;
  return {
    type,
    title: match[2].trim() || CALLOUT_TYPES[type],
    rest: text.slice(match[0].length),
  };
};

const toCallout = (blockquote: MdastNode) => {
  const [first] = blockquote.children ?? [];
  const lead = first?.type === "paragraph" ? first.children?.[0] : undefined;
  if (lead?.type !== "text") return;

  const marker = parseCalloutMarker(lead.value ?? "");
  if (!marker) return;

  lead.value = marker.rest;
  if (!lead.value) first!.children!.shift();
  // A soft break right after the marker line leaves a leading break node.
  if (first!.children?.[0]?.type === "break") first!.children.shift();
  if (first!.children?.length === 0) blockquote.children!.shift();

  blockquote.data = {
    hName: "div",
    hProperties: { className: ["callout", `callout--${marker.type}`] },
  };
  blockquote.children!.unshift({
    type: "paragraph",
    data: { hProperties: { className: ["callout__title"] } },
    children: [{ type: "text", value: marker.title }],
  });
};

// GitHub-style alerts: a blockquote opening with "[!NOTE]", "[!TIP]",
// "[!IMPORTANT]", "[!WARNING]" or "[!CAUTION]" renders as a callout box.
export default function remarkCallouts() {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      if (node.type === "blockquote") toCallout(node);
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
