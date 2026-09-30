import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import rehypeHeadingText from "./src/utils/rehypeHeadingText";
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
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    // rehypeHeadingText must run before KaTeX renders math in headings.
    rehypePlugins: [rehypeHeadingText, rehypeKatex],
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
    // @ts-expect-error Tailwind's Vite plugin is typed for Vite 7 and Astro 5
    // bundles Vite 6; drop this once Astro ships Vite 7 (withastro/astro#14030).
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
  experimental: {
    preserveScriptOrder: true,
  },
});
