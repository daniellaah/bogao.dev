import { getViteConfig } from "astro/config";
import type { ViteUserConfig } from "vitest/config";

// Astro's Vite config gives tests the same `@/` aliases and `astro:*` virtual
// modules as the site build. Tests run in Node so the Container API can render
// real components; DOM tests create a happy-dom window (tests/helpers/dom.ts).
const config: ViteUserConfig = {
  test: {
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
};

// Astro types its parameter against the Vite version it bundles.
export default getViteConfig(config as Parameters<typeof getViteConfig>[0]);
