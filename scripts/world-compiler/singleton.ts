import type { CompilerError, EntityType, ValidatedEntity } from "./types.js";

/**
 * Reads "x-singleton" metadata off a raw JSON Schema. Unlike "x-ref" (a
 * per-property flag), "x-singleton" is declared at schema root: it means
 * "at most one validated entity of this type may exist in the world."
 */
export function isSingletonSchema(rawSchema: Record<string, unknown>): boolean {
  return rawSchema["x-singleton"] === true;
}

/**
 * Verifies every type flagged "x-singleton" has at most one validated
 * instance. Fully generic over singletonTypes — zero per-type branching,
 * mirroring resolve.ts's approach to "x-ref". One error per entity beyond
 * the first (sorted by file, so the message is deterministic), naming the
 * file that already defines the type — same shape as compile-world.ts's
 * existing "duplicate-id" message.
 */
export function checkSingletonCollections(
  entities: ValidatedEntity[],
  singletonTypes: Set<EntityType>,
): CompilerError[] {
  const errors: CompilerError[] = [];
  const byType = new Map<EntityType, ValidatedEntity[]>();

  for (const entity of entities) {
    if (!singletonTypes.has(entity.type)) continue;
    if (!byType.has(entity.type)) byType.set(entity.type, []);
    byType.get(entity.type)!.push(entity);
  }

  for (const [type, group] of byType) {
    if (group.length <= 1) continue;
    const [first, ...rest] = [...group].sort((a, b) => a.file.localeCompare(b.file));
    for (const extra of rest) {
      errors.push({
        kind: "singleton-violation",
        file: extra.file,
        message: `Only one "${type}" entity may exist in the world; another is already defined in ${first.file}`,
      });
    }
  }

  return errors;
}
