// Read model for Hall of Knowledge. Named around the district's public
// vocabulary ("knowledge", "notes") rather than the underlying entity type
// — the canonical entity stays `Note` (see world.ts) since Hall of
// Knowledge presents notes, it isn't a separate content type. Every
// function here reads only from the already-compiled `world.notes`
// collection, which by construction (publish-gating in
// scripts/world-compiler/assemble.ts) can never contain an unpublished
// note — there is no "published: false" entity for any of this to
// accidentally expose.

import { world, getDistrict } from "./world.js";
import type { Note, District } from "./world.js";

/** Every note in the compiled world — already published-only by
 * construction, but named explicitly so that invariant is documented at
 * the call site, not just implied. */
export function listPublishedNotes(): Note[] {
  return world.notes;
}

const notesBySlug = new Map<string, Note>(world.notes.map((note) => [note.slug, note]));

export function getKnowledgeNote(slug: string): Note | undefined {
  return notesBySlug.get(slug);
}

export function getNotesByCategory(category: Note["category"]): Note[] {
  return world.notes.filter((note) => note.category === category);
}

/** Resolves a note's `relatedNoteIds` to real Note objects — any id that
 * doesn't resolve (e.g. it pointed at a since-unpublished note) is simply
 * omitted, not an error; the compiler already guarantees every id was
 * valid at compile time. */
export function getRelatedNotes(noteId: string): Note[] {
  const note = world.notes.find((candidate) => candidate.id === noteId);
  if (!note?.relatedNoteIds) return [];

  return note.relatedNoteIds
    .map((relatedId) => world.notes.find((candidate) => candidate.id === relatedId))
    .filter((related): related is Note => related !== undefined);
}

export interface KnowledgeCategory {
  category: Note["category"];
  count: number;
}

/** Only categories with at least one real published note — "no fake
 * folders" — sorted alphabetically for stable, scannable output. */
export function getKnowledgeCategories(): KnowledgeCategory[] {
  const counts = new Map<Note["category"], number>();
  for (const note of world.notes) {
    counts.set(note.category, (counts.get(note.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/** Shared by KnowledgeTree and KnowledgeNoteArtifact so category display
 * wording never drifts between the two. */
export function categoryLabel(category: Note["category"]): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/** The single place a knowledge-note artifact URL is built — mirrors
 * getRepositoryArtifactPath/getCertificationArtifactPath. Returns
 * undefined (no link renders) if the note has no real district to nest
 * its route under. */
export function getKnowledgeNoteArtifactPath(note: Note): string | undefined {
  if (!note.districtId) return undefined;
  const district: District | undefined = getDistrict(note.districtId);
  if (!district) return undefined;
  return `/valley/${district.slug}/${note.slug}`;
}
