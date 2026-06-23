import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "./noteVisibility";

export default function getSortedNotes(notes: CollectionEntry<"notes">[]) {
  return getPublishedNotes(notes).sort(
    (a, b) => b.data.noteDate.getTime() - a.data.noteDate.getTime()
  );
}
