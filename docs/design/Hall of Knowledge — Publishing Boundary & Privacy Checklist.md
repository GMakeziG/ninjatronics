# Hall of Knowledge — Publishing Boundary & Privacy Checklist

This document defines the content-safety boundary for Hall of Knowledge —
the district that will eventually present a curated, public slice of a
private Obsidian vault. It exists so that boundary is written down once,
clearly, rather than assumed.

---

## 1. The publishing boundary

**Canonical public source:** `content/knowledge/**/*.json`

That is the *only* place the World Compiler ever reads knowledge-note
content from. Concretely:

- `scripts/world-compiler/discover.ts` walks exactly one fixed, relative
  directory: `content/` (resolved from the repo root). It has no concept
  of, and never reads, any path outside the repository.
- The compiler **never** reads `~/Documents/Obsidian`, an entire Obsidian
  vault, an arbitrary filesystem path, or any synced private folder — not
  today, and not as a "temporary" shortcut. There is no code path that
  does this anywhere in `scripts/world-compiler/`.
- A knowledge note becomes public *only* by an explicit, human decision:
  someone writes (or copies/adapts) a `content/knowledge/**/*.json` file,
  by hand, in this repository.

**This milestone does not ingest the Obsidian vault.** It builds the
schema, validation, read model, routes, and UI that a *future*, separate
import step will feed. That future step is expected to:

1. Read from the private vault (or a deliberately-curated public staging
   copy of selected notes — never the full vault) in its own tooling,
   outside this repository's compiler.
2. Explicitly select which notes are candidates for publishing — nothing
   is published by default or by proximity to other public notes.
3. Transform each selected note into the same canonical shape validated
   here (id, slug, title, summary, category, body, published, updatedAt,
   …) and write it to `content/knowledge/**/*.json`.
4. Never write Obsidian-internal metadata (vault-relative backlinks, plugin
   front-matter, graph-view data, local file paths) into that output — the
   schema's `additionalProperties: false` makes this structurally
   impossible to do by accident, not just a style guideline.

Until that import step exists, every file under `content/knowledge/` is
written directly, by hand, the same way every other domain's content is.

## 2. Markdown authoring decision (this milestone)

Knowledge notes are authored as ordinary JSON entities — the same
convention every other domain already uses — with `body` as a plain
Markdown-formatted **string** field. No `.md` file discovery, no YAML
frontmatter parser, and no Markdown-to-HTML rendering dependency were
added. This was a deliberate choice, not a placeholder:

- It reuses the existing, already-hardened JSONC pipeline
  (`discover.ts`/`load.ts`) completely unchanged.
- It proves the schema, validation, privacy boundary, read model, and UI
  before a second parser/dependency enters the toolchain.
- A future Markdown-file-based import step is expected to produce this
  *exact same* JSON entity shape (with `body` as a string) as its output —
  so the schema, read model, and UI never need to change when that import
  step is introduced. The importer's job is to *become* this shape, not
  the other way around.

`RepositoryArtifact`/`CertificationArtifact`'s established pattern (a
small, disclosed, non-general body renderer recognizing only the
conventions this project's own notes use — see `KnowledgeNoteArtifact.tsx`)
is the same conservative choice: no invented full Markdown parser, no
fragile regex frontmatter parsing.

## 3. Knowledge taxonomy

Initial categories (enforced by `schemas/entities/note.schema.json`'s
`category` enum):

```
linux · networking · cloud · automation · security · kubernetes · projects · career
```

`content/knowledge/<category>/` subfolders are created only as real notes
need them — an empty category folder is never created "for appearance."
The Hall of Knowledge district page only ever renders categories that have
at least one real published note (`getKnowledgeCategories()` in
`src/lib/knowledge.ts`) — there are no fake/placeholder folders in the UI
either.

## 4. Schema-enforced rules

- `published` is **required** and must be exactly `true` for a note to
  reach `data/world.json` — this is enforced by the compiler's generic
  `x-requires-published` mechanism (`scripts/world-compiler/publish-gate.ts`),
  not a per-type special case. A note missing `published` entirely fails
  schema validation outright (fails closed); a note with `published: false`
  passes validation but is silently excluded from the assembled world.
- `slug` must be unique per entity type — enforced generically in
  `scripts/compile-world.ts` (any entity type with a `slug` field gets
  this check, not just notes).
- `relatedSkillIds`, `relatedRepositoryIds`, `relatedNoteIds`, and
  `districtId` are all `x-ref` fields — the compiler fails the build if any
  of them points at an id that doesn't exist, the same generic mechanism
  every other domain's references already use.
- `source` (optional provenance text) has a schema pattern rejecting
  values that start with `/` or `~` — a structural guard against an
  absolute filesystem path ending up in public output, not just a
  convention to remember.
- `additionalProperties: false` means no field beyond the ones explicitly
  declared in the schema can ever appear in a note entity — there is no way
  to "accidentally" carry extra private metadata through validation.

## 5. Publishing checklist

Before setting `"published": true` on any knowledge note, confirm every
item below. This is a manual review checklist — it is not (and is not
meant to be) automated content scanning.

- [ ] The note is marked `published: true` deliberately — this is a real
      decision, not a default.
- [ ] No secrets, tokens, passwords, or API keys appear anywhere in the
      note (title, summary, body, tags).
- [ ] No internal IP addresses, hostnames, or internal domain names appear
      anywhere in the note.
- [ ] No customer, client, or employer-identifying information appears
      anywhere in the note (names, environment names, ticket numbers,
      contract details).
- [ ] No Controlled Unclassified Information (CUI) or other
      compliance-sensitive material appears anywhere in the note.
- [ ] No personal journal content, private reflection, or anything not
      intended for a public audience appears in the note.
- [ ] No private backlinks or references to non-public notes/vault paths
      appear in the note (`relatedNoteIds` only references notes that are
      themselves intended to be public).
- [ ] Every `relatedSkillIds`/`relatedRepositoryIds`/`relatedNoteIds`/
      `districtId` value is real and resolves (the compiler enforces this,
      but review it directly too — a reference resolving is not the same
      as it being the *right* reference).
- [ ] Every external link in the note (if any) is safe to share publicly
      and points where it claims to point.
- [ ] The note reads as generically useful/educational, not as a
      description of a specific employer's specific systems.

If any box can't be checked, the note stays `published: false` (or isn't
written at all) until it can.
