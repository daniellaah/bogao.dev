---
title: "MIDI2Score"
description: "A Transformer-based sequence-to-sequence project for converting MIDI token sequences into MusicXML token sequences."
status: "active"
order: -1
startDate: 2026-03-13
featured: false
year: 2026
stack:
  - Python
  - Transformers
  - MIDI
  - MusicXML
repoUrl: "https://github.com/daniellaah/MIDI2Score"
---

## What it is

MIDI2Score explores whether symbolic music transcription can be framed as a sequence-to-sequence problem, with MIDI token sequences as input and MusicXML token sequences as output.

## Problem

Turning raw symbolic music data into readable score structure is not just a formatting task. It requires a representation that can preserve musical intent while staying learnable for a sequence model.

## Approach

The project uses a Transformer-based setup and treats the conversion problem as token-to-token translation. That keeps the framing close to modern sequence modeling workflows while staying focused on symbolic music rather than audio.

## Why it matters

Even in its early state, the project is a useful experiment at the intersection of generative modeling, structured outputs, and music representation.
