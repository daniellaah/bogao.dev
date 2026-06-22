---
title: "ComiRec with Autoresearch"
description: "A compact autoresearch-style recommender systems experiment built around ComiRec-SA, fixed Amazon Books data, and short iteration loops."
status: "shipping"
order: -1
startDate: 2026-03-15
featured: false
year: 2026
stack:
  - Python
  - uv
  - Recommender Systems
  - Amazon Books
repoUrl: "https://github.com/daniellaah/ComiRec-with-Autoresearch"
---

## What it is

This project turns a recommender model experiment into a small, repeatable research loop. The setup is intentionally narrow: Amazon Books, ComiRec-SA, fixed data preparation, and a strict short runtime budget.

## Problem

Many recommendation experiments become hard to compare because the data preparation, training budget, and evaluation setup keep drifting between runs. That makes it difficult to know whether a result came from a better idea or a changed protocol.

## Approach

The repository splits stable infrastructure from mutable experiment code. `prepare.py` defines the fixed protocol, while `train.py` stays as the main place for iteration, model edits, and short-run comparisons.

## Why it matters

The project is useful as a minimal testbed for autoresearch-style workflows in recommender systems, where the goal is not a full platform but a clean loop for trying one idea at a time.
