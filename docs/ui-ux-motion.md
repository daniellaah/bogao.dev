# UI/UX and Motion Guidelines

BoGao.Dev is an Astro static blog. Prefer CSS, semantic HTML, and small
vanilla scripts before adding UI runtimes.

## Library Adoption

- Do not add React, shadcn/ui, Radix UI, React Aria, Motion for React, GSAP,
  Rive, dotLottie, Storybook, or AI SDK UI unless a feature clearly needs it.
- Use shadcn/skills, Radix, and React Aria as interaction references: focus,
  keyboard behavior, touch targets, ARIA states, and component anatomy.
- Use Motion for React only after a React island exists and animation state is
  too complex for CSS transitions.
- Use GSAP only for an intentionally designed standalone narrative page.
- Use Rive or dotLottie only for finished brand animation assets, not routine
  loading or empty states.
- Use AI SDK UI only for real AI tool-call output such as generated summaries
  or semantic search, not decorative blog UI.

## Motion Tokens

Use the global CSS tokens in `src/styles/global.css`:

- `--motion-duration-press`: button press and tactile feedback.
- `--motion-duration-fast`: small opacity or color changes.
- `--motion-duration-base`: search expansion and hand-drawn affordances.
- `--motion-duration-medium`: close timing and medium UI state changes.
- `--motion-duration-slow`: larger opacity blends.
- `--motion-duration-morph`: theme icon morphs.
- `--motion-duration-thinking`: command-palette thinking indicator.
- `--motion-ease-standard`: simple state changes.
- `--motion-ease-out`: short one-way fades.
- `--motion-ease-smooth`: smooth icon morphs.
- `--motion-ease-snappy`: search and command-palette expansion.
- `--motion-ease-thinking`: command-palette thinking indicator.

All new motion must respect `prefers-reduced-motion: reduce`.

## Interaction Checklist

- Dialog-like UI must support Escape, focus return, focus trapping, and visible
  focus styles.
- Filter controls must expose `aria-pressed` or `aria-current`.
- Current navigation or TOC state must expose `aria-current`.
- Loading search or async states must expose `aria-busy` or live status text.
- Touch targets should stay at least 44px on mobile.
- Avoid page-level entrance animations on long reading pages.

## Validation

For UI/UX changes, run:

```bash
npm test
npm run content:check
npm run format:check
npm run lint
npm run build
```

If visual regressions become frequent, add Playwright screenshot checks before
adding Storybook.
