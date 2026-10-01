---
title: "Project Name"
description: "One clear sentence about what this project does and why it matters."
kicker: "Project"
tags:
  - Highlight
status: "active"
draft: true
order: 10
startDate: 2026-04-01
featured: false
year: 2026
stack:
  - Astro
  - TypeScript
demoUrl: "https://example.com"
repoUrl: "https://github.com/yourname/project"
# Case study fields, all optional.
role: "Solo: design, build and evaluation"
metrics:
  - value: "+12%"
    label: "nDCG@10 over BM25"
  - value: "180 ms"
    label: "p95 latency"
cover:
  src: "./images/project-architecture.png"
  alt: "Architecture diagram: query router, retrievers and reranker"
  caption: "Optional caption"
---

Set `order: -1` if you want this project to be sorted automatically by `startDate` instead of a fixed manual position.

Write it as a case study: a reader should know the problem, your decisions
and the results within a minute. Put the headline numbers in `metrics`.

## Problem

Who had the problem, why it mattered, and what made it hard.

## Approach

The architecture and the key decisions, including the alternatives you
rejected and why.

## Results

What shipped and what it achieved, measured against a baseline.

## What I learned

What you would do differently, and what still needs work.
