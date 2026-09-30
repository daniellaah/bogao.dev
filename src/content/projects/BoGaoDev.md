---
title: "BoGao.Dev"
description: "This site: an Astro portfolio with content collections, site-wide search, RSS, and light/dark themes, deployed on Vercel."
kicker: "Personal site"
tags:
  - Astro
  - TypeScript
  - Tailwind CSS
  - Vercel
status: "shipping"
order: 10
startDate: 2026-02-04
featured: false
year: 2026
stack:
  - Astro
  - TypeScript
  - Tailwind CSS
  - Vercel
repoUrl: "https://github.com/daniellaah/bogao.dev"
---

## What it is

My personal site and portfolio: a home for my projects, open-source
contributions, and writing. It is a static Astro site, deployed on Vercel from
this repository.

## How it's built

- **Typed content.** Projects and posts are Markdown files in Astro content
  collections with a validated schema, plus a `content:check` script that
  flags missing or unknown frontmatter before a build.
- **Search without a backend.** A search index is generated at build time and
  queried in the browser, both on `/search` and in a ⌘K / Ctrl+K command
  palette.
- **One card, everywhere.** Projects and open-source contributions share a
  single card component, so the homepage and the projects page cannot drift
  apart.
- **Maintainability tests.** A Node test suite covers routing, search, content
  rules, and the client-side scripts.

The rest is the usual plumbing, done properly: RSS, a sitemap, Open Graph
tags, and light and dark themes.

## How I work on it

I build the site with AI coding tools such as Claude Code. I decide what the
site should say and how it should look, review every change, and keep it
covered by tests; the tools make each iteration faster.
