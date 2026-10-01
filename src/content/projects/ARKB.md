---
title: "Agentic RAG"
description: "An agentic RAG system where the agent decides how to search, what to read, and when to stop, instead of following a fixed retrieve-then-generate pipeline."
kicker: "Featured project"
tags:
  - Agentic RAG
  - Hybrid retrieval
  - MCP
  - Evaluation
  - SFT / LoRA
status: "active"
order: 1
featured: true
year: 2026
stack:
  - Python
  - BM25 / dense / hybrid retrieval
  - Qdrant
  - MCP
  - Ollama
  - MLX-LM
repoUrl: "https://github.com/daniellaah/ARKB"
metrics:
  - value: "5"
    label: "Agent tools: match, search, read, list, links"
  - value: "4"
    label: "Retrieval baselines, BM25 to hybrid + rerank"
  - value: "3"
    label: "Benchmarks: SciFact, Bright-Pro, MuSiQue"
---

## The problem

A fixed RAG pipeline runs the same sequence for every query:

```text
fixed RAG : query -> retrieve -> assemble context -> generate
```

That works for question answering, but knowledge-base queries are not all
questions. "Which notes mention RAG?" needs exact lexical matching. "Find notes
related to agent memory" needs semantic or hybrid search. "Find material for an
article about AI agents" needs several rounds of searching and reading. "What is
retrieval-augmented generation?" may need no retrieval at all.

## The mechanism

ARKB treats retrieval as an iterative process controlled by an agent:

```text
ARKB      : query -> reason -> match / search / read -> observe -> repeat -> respond
```

The design separates two responsibilities:

- **Agent control** chooses tools, search modes, queries, and when to stop.
- **Retrieval execution** performs matching, ranking, fusion, and reranking. It
  does not plan or generate answers.

The agent works through a small set of tools: `match` for literal occurrences,
`search` for ranked chunks (BM25, semantic, or hybrid with RRF and optional
reranking), `read` to expand a promising source, plus `list` and `links` to
navigate the knowledge base. It can reformulate queries, switch retrieval
strategies, and stop when the evidence is sufficient.

The same tools are exposed through a CLI with JSON output and a read-only MCP
server, so Claude Code or another MCP client can act as the agent instead.

## What I measure

Evaluation covers both the retrieval layer and the agent's behavior:

| Evaluation                | Measurements                                                                      |
| ------------------------- | --------------------------------------------------------------------------------- |
| Fixed retrieval baselines | Source Recall@K, MRR, nDCG@K, latency, errors                                     |
| Agent evaluation          | Task success, source recall, required reads, tool usage, turns, stopping behavior |
| Model ablation            | Repeated trials across models, success consistency, latency, evidence gathering   |

The fixed baselines are `bm25`, `semantic`, `hybrid`, and `hybrid_rerank`.
Active evaluation uses SciFact, Bright-Pro technical domains, and MuSiQue.

## Post-training

To make a small local model a better retrieval agent, I built a pipeline that
generates synthetic agent trajectories through DeepSeek API rollouts, filters
the successful traces, and fine-tunes Qwen3 with SFT and LoRA using MLX-LM, for
tool calling, query reformulation, and multi-step retrieval.

## Scope

ARKB currently targets English Markdown notes and queries.

## Links

- [Repository](https://github.com/daniellaah/ARKB)
