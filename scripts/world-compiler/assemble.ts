import { ENTITY_REGISTRY } from "./registry.js";
import { isPublished } from "./publish-gate.js";
import type { EntityType, ValidatedEntity, World } from "./types.js";

/**
 * Groups validated entities into their output collections (sorted by id for
 * deterministic diffs), applying publish-gating for any type whose schema
 * declared "x-requires-published" (see publish-gate.ts) — an unpublished
 * entity of a gated type never reaches data/world.json at all, regardless
 * of how the frontend later requests data. `entityCount` reflects what's
 * actually in the assembled collections, not the pre-filter validated
 * total, so it never hints at unpublished content existing.
 */
export function assembleWorld(
  entities: ValidatedEntity[],
  sourceFileCount: number,
  publishGatedTypes: Set<EntityType> = new Set(),
): World {
  const collections: Record<string, unknown[]> = {};

  for (const entry of ENTITY_REGISTRY) {
    const gated = publishGatedTypes.has(entry.type);
    collections[entry.collection] = entities
      .filter((entity) => entity.type === entry.type)
      .filter((entity) => !gated || isPublished(entity))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((entity) => ({ ...entity.data, type: entry.type }));
  }

  const entityCount = Object.values(collections).reduce((sum, items) => sum + items.length, 0);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFileCount,
      entityCount,
    },
    ...collections,
  };
}
