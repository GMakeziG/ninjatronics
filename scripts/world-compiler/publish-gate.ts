import type { ValidatedEntity } from "./types.js";

/**
 * Reads "x-requires-published" metadata off a raw JSON Schema. Mirrors
 * singleton.ts's "x-singleton" pattern: a schema-root boolean flag an
 * entity type opts into, read generically by the compiler rather than a
 * hardcoded "if type === note" check anywhere in the pipeline.
 *
 * An entity of a gated type is excluded from the assembled world unless
 * its own `published` field is exactly `true` — schema validation still
 * runs on every entity regardless (a malformed draft still fails closed),
 * only assembly is affected.
 */
export function isPublishGatedSchema(rawSchema: Record<string, unknown>): boolean {
  return rawSchema["x-requires-published"] === true;
}

export function isPublished(entity: ValidatedEntity): boolean {
  return entity.data.published === true;
}
