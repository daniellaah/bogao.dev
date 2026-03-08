import type { CollectionEntry } from "astro:content";

export default function getSortedNotes(notes: CollectionEntry<"notes">[]) {
  return notes
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.noteDate).getTime() - new Date(a.data.noteDate).getTime()
    );
}
