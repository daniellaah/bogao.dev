import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import rehypeHeadingText from "./src/utils/rehypeHeadingText";
import remarkCallouts from "./src/utils/remarkCallouts";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  redirects: {
    // About content now lives on the homepage.
    "/about": "/",
  },
  // Every internal link and canonical URL ends in "/"; see also vercel.json.
  trailingSlash: "always",
  // MDX reuses the markdown config below, so .mdx posts get the same
  // plugins and code highlighting as .md.
  integrations: [sitemap(), mdx()],
  // Astro 7 strips whitespace between inline elements by default ("jsx");
  // keep the markup's spaces, which the templates rely on.
  compressHTML: true,
  markdown: {
    // remark/rehype, which Astro 7 no longer uses by default, for the math
    // and heading-text plugins.
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts],
      // rehypeHeadingText must run before KaTeX renders math in headings.
      rehypePlugins: [rehypeHeadingText, rehypeKatex],
    }),
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_BAIDU_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
