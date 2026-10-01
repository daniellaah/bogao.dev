import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { SITE } from "@/config";
import { loadFonts } from "./fonts";

// Social cards for posts and projects, drawn at build time in the style of
// public/og.png: a taped index card on dotted paper.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Light-theme tokens from global.css.
const COLORS = {
  paper: "#f6f1e7",
  card: "#fffdf8",
  ink: "#171717",
  graphite: "#5c574f",
  dots: "#d8cebd",
  tapeYellow: "#ffd54a",
  tapeBlue: "#8cc4ff",
};

// Chip fills: the marker accents mixed into the card color, as on og.png.
const CHIP_FILLS = ["#fdf0c4", "#e3effc", "#fde4ec", "#dff4e7"];

export type OgCard = {
  title: string;
  description: string;
  tags: string[];
  // Footer line under the author, e.g. "Sep 30, 2026 · 8 min read".
  meta: string;
};

type Child = OgNode | string | false | null | undefined;
type OgNode = {
  type: string;
  props: Record<string, unknown> & { children?: Child | Child[] };
};

const h = (
  type: string,
  props: Record<string, unknown>,
  ...children: Child[]
): OgNode => {
  const kept = children.filter(child => child);
  // Satori counts an empty array as several children, which a box needs
  // `display: flex` for, so pass a lone child (or none) unwrapped.
  return {
    type,
    props: { ...props, children: kept.length > 1 ? kept : kept[0] },
  };
};

const CJK = /[　-鿿가-힯＀-￯]/g;

/** Title size by visual length; a CJK character is about two Latin ones. */
export const titleFontSize = (title: string) => {
  const length = title.length + (title.match(CJK)?.length ?? 0);
  if (length <= 36) return 66;
  if (length <= 64) return 56;
  return 46;
};

let avatar: Promise<string> | undefined;

// Rasterized once: the source SVG's embedded <style> is beyond Satori.
const loadAvatar = () =>
  (avatar ??= readFile(path.resolve("public/images/site/avatar.svg"))
    .then(svg => sharp(svg).resize(128, 128).png().toBuffer())
    .then(png => `data:image/png;base64,${png.toString("base64")}`));

const tape = (color: string, side: "left" | "right", rotate: number) =>
  h("div", {
    style: {
      position: "absolute",
      top: -20,
      [side]: 64,
      width: 150,
      height: 36,
      backgroundColor: color,
      opacity: 0.92,
      // The torn edges of --tape-shape in global.css, scaled to 150×36.
      // Satori misreads percentages here, so the points are in pixels.
      clipPath:
        "polygon(0px 4px, 9px 0px, 18px 5px, 150px 1px, 141px 11px, 150px 21px, 142px 36px, 12px 32px, 0px 36px, 7px 20px)",
      transform: `rotate(${rotate}deg)`,
    },
  });

const chip = (label: string, index: number) =>
  h(
    "div",
    {
      style: {
        display: "flex",
        padding: "6px 16px",
        border: "1.5px solid rgba(23, 23, 23, 0.28)",
        borderRadius: 8,
        backgroundColor: CHIP_FILLS[index % CHIP_FILLS.length],
        fontSize: 22,
        fontWeight: 500,
      },
    },
    label
  );

const cardTree = (card: OgCard, avatarSrc: string) =>
  h(
    "div",
    {
      style: {
        display: "flex",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        padding: "64px 72px",
        backgroundColor: COLORS.paper,
        // Satori sizes gradient stops in percentages only.
        backgroundImage: `radial-gradient(${COLORS.dots} 8%, transparent 10%)`,
        backgroundSize: "28px 28px",
        color: COLORS.ink,
        fontFamily: "Figtree",
      },
    },
    h(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "52px 64px 44px",
          backgroundColor: COLORS.card,
          border: `2px solid ${COLORS.ink}`,
          borderRadius: 18,
          boxShadow: "0 18px 40px -20px rgba(60, 45, 20, 0.35)",
        },
      },
      tape(COLORS.tapeYellow, "left", -4),
      tape(COLORS.tapeBlue, "right", 3),
      card.tags.length > 0 &&
        h(
          "div",
          { style: { display: "flex", gap: 12, marginBottom: 26 } },
          ...card.tags.slice(0, 3).map(chip)
        ),
      h(
        "div",
        {
          style: {
            display: "block",
            fontSize: titleFontSize(card.title),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.14,
            lineClamp: 3,
          },
        },
        card.title
      ),
      h(
        "div",
        {
          style: {
            display: "block",
            marginTop: 20,
            color: COLORS.graphite,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.45,
            lineClamp: 2,
          },
        },
        card.description
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 16 } },
          h("img", {
            src: avatarSrc,
            width: 60,
            height: 60,
            style: {
              borderRadius: 999,
              border: `2px solid ${COLORS.ink}`,
              backgroundColor: COLORS.card,
            },
          }),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column" } },
            h("div", { style: { fontSize: 24, fontWeight: 700 } }, SITE.author),
            h(
              "div",
              {
                style: {
                  color: COLORS.graphite,
                  fontSize: 20,
                  fontWeight: 500,
                },
              },
              card.meta
            )
          )
        ),
        h(
          "div",
          {
            style: {
              color: COLORS.graphite,
              fontFamily: "Handlee",
              fontSize: 34,
            },
          },
          new URL(SITE.website).hostname
        )
      )
    )
  );

/** A 1200×630 PNG social card. */
export const renderOgImage = async (card: OgCard) => {
  const text = [card.title, card.description, card.meta, ...card.tags].join(
    " "
  );
  const svg = await satori(
    cardTree(card, await loadAvatar()) as Parameters<typeof satori>[0],
    { width: OG_WIDTH, height: OG_HEIGHT, fonts: await loadFonts(text) }
  );
  return sharp(Buffer.from(svg)).png().toBuffer();
};
