import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "./noteVisibility";

export default function getSortedNotes(notes: CollectionEntry<"notes">[]) {
  return getPublishedNotes(notes).sort(
    (a, b) =>
      new Date(b.data.noteDate).getTime() - new Date(a.data.noteDate).getTime()
  );
}
