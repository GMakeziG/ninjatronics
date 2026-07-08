import type { RegistryEntry } from "./types.js";

/**
 * Maps each content/ subfolder to its entity type, output collection, and schema.
 * Adding a new domain to the world means: add a folder under content/, add a
 * schema under schemas/entities/, and register it here.
 */
export const ENTITY_REGISTRY: RegistryEntry[] = [
  { folder: "districts", type: "district", collection: "districts", schemaFile: "district.schema.json" },
  { folder: "guardians", type: "guardian", collection: "guardians", schemaFile: "guardian.schema.json" },
  { folder: "repositories", type: "repository", collection: "repositories", schemaFile: "repository.schema.json" },
  { folder: "projects", type: "project", collection: "projects", schemaFile: "project.schema.json" },
  { folder: "quests", type: "quest", collection: "quests", schemaFile: "quest.schema.json" },
  { folder: "notes", type: "note", collection: "notes", schemaFile: "note.schema.json" },
  { folder: "skills", type: "skill", collection: "skills", schemaFile: "skill.schema.json" },
  { folder: "certifications", type: "certification", collection: "certifications", schemaFile: "certification.schema.json" },
];

export function findRegistryEntry(folder: string): RegistryEntry | undefined {
  return ENTITY_REGISTRY.find((entry) => entry.folder === folder);
}
