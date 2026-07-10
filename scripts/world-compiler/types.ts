// Shared types for the World Compiler pipeline and its consumers (frontend, Oracle, integrations).

export type EntityType =
  | "district"
  | "guardian"
  | "repository"
  | "project"
  | "quest"
  | "note"
  | "skill"
  | "certification"
  | "profile"
  | "experience";

/** A single loosely-typed JSON entity as read from content/. */
export type RawEntity = Record<string, unknown> & { id?: unknown };

/** An entity after successful schema validation, tagged with its resolved type. */
export interface ValidatedEntity {
  type: EntityType;
  id: string;
  file: string;
  data: Record<string, unknown>;
}

export interface ContentFile {
  /** Absolute path on disk. */
  absPath: string;
  /** Path relative to the content/ directory, e.g. "districts/git-forest.json". */
  relPath: string;
  /** Top-level folder under content/, e.g. "districts". */
  folder: string;
}

export type CompilerErrorKind =
  | "unknown-folder"
  | "parse"
  | "schema"
  | "duplicate-id"
  | "unresolved-reference"
  | "singleton-violation";

export interface CompilerError {
  kind: CompilerErrorKind;
  file: string;
  message: string;
}

export interface RegistryEntry {
  /** Folder name under content/, e.g. "districts". */
  folder: string;
  /** Singular entity type name, e.g. "district". */
  type: EntityType;
  /** Key used for the entity's collection in the assembled world.json, e.g. "districts". */
  collection: string;
  /** Filename of the entity's JSON Schema under schemas/entities/. */
  schemaFile: string;
}

export interface WorldMeta {
  generatedAt: string;
  sourceFileCount: number;
  entityCount: number;
}

/**
 * The final assembled shape written to data/world.json: a "meta" key plus one
 * array per registered collection. Kept loose here since it's produced
 * generically from the registry — consumers (e.g. src/lib/world.ts) define
 * their own precise World interface over the same JSON.
 */
export type World = Record<string, unknown>;
