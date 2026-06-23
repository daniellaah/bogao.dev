---
title: "BoGao.Dev"
description: "A personal publishing system for machine learning writing, LLM workflow write-ups, project pages, and lightweight research logs."
status: "shipping"
order: -1
startDate: 2026-02-04
featured: false
year: 2026
stack:
  - Astro
  - GitHub
  - Vercel
demoUrl: "https://bogao.dev"
repoUrl: "https://github.com/daniellaah/daniellaah.github.io"
---

## What it is

This site started as an Astro Paper setup, then gradually turned into a personal system for publishing ML writing, LLM workflow experiments, and project pages.

The goal is not to build a complicated CMS. The goal is to keep publishing simple while making room for long-form technical writing, experiments, and project documentation.

## What changed

- Reworked the homepage and information architecture to remove most of the template feel.
- Added a dedicated projects collection so project pages do not live in the same content bucket as long-form writing.
- Migrated historical machine learning writing into a consistent frontmatter format.
- Switched math rendering to compile-time KaTeX for archived ML notes and formulas.
- Deployed the site through GitHub and Vercel with sitemap, Open Graph, and search indexing in place.

## Why it matters

I wanted a publishing workflow that stays close to code: Markdown files, git history, predictable builds, and no hidden admin panel.

This project is also where I test how a technical blog should feel when it is used as both a writing archive and a lightweight surface for experiments.

## Next steps

- Add more real ML/AI project entries and improve the visual identity.
- Design a custom Open Graph image instead of relying on the default one.
- Keep refining the balance between writing, projects, and long-term maintainability.
