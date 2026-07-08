import { ENTITY_REGISTRY } from "./registry.js";
import type { ValidatedEntity, World } from "./types.js";

/**
 * Groups validated entities into their output collections (sorted by id for
 * deterministic diffs) and attaches compiler metadata.
 */
export function assembleWorld(entities: ValidatedEntity[], sourceFileCount: number): World {
  const world: World = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFileCount,
      entityCount: entities.length,
    },
  };

  for (const entry of ENTITY_REGISTRY) {
    world[entry.collection] = entities
      .filter((entity) => entity.type === entry.type)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((entity) => ({ ...entity.data, type: entry.type }));
  }

  return world;
}
