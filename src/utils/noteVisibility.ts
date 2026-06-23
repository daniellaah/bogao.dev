import type { CollectionEntry } from "astro:content";

export const isPublishedNote = (note: CollectionEntry<"notes">) =>
  !note.data.draft;

export const getPublishedNotes = (notes: CollectionEntry<"notes">[]) =>
  notes.filter(isPublishedNote);
