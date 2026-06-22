---
title: "Semantic Retrieval Benchmark for Book Recommendation"
description: "An offline benchmark for comparing embedding models and dimensions on book recommendation retrieval using Amazon Reviews 2023."
status: "shipping"
order: -1
startDate: 2026-03-01
featured: false
year: 2026
stack:
  - Python
  - Embeddings
  - Hugging Face
  - Retrieval Evaluation
repoUrl: "https://github.com/daniellaah/Semantic-Retrieval-Benchmark-for-Book-Recommendation"
---

## What it is

This repository is an end-to-end offline benchmark for semantic retrieval in book recommendation. It covers data preparation, embedding generation, reusable baselines, metric evaluation, and plotting.

## Problem

Comparing embedding models for retrieval often turns into a mix of one-off scripts, inconsistent metrics, and undocumented preprocessing. That makes it difficult to understand whether a model is actually better or just evaluated differently.

## Approach

The benchmark standardizes the workflow around a fixed evaluation set and a shared metric suite, including Recall, NDCG, and MRR. It also keeps non-semantic baselines in the same pipeline so embedding models are compared against something concrete.

## Why it matters

This project creates a cleaner way to evaluate retrieval quality for recommendation tasks and makes it easier to inspect tradeoffs across model families and embedding dimensions.
