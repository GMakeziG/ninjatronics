import type { CompilerError, EntityType, ValidatedEntity } from "./types.js";

interface RefField {
  property: string;
  targetType: EntityType;
  isArray: boolean;
}

/**
 * Reads "x-ref" metadata off a raw JSON Schema to find which properties are
 * ID references, and to what entity type. A property is a reference field
 * when it (or its array "items") declares "x-ref": "<entityType>".
 */
export function findRefFields(rawSchema: Record<string, unknown>): RefField[] {
  const properties = (rawSchema.properties ?? {}) as Record<string, Record<string, unknown>>;
  const fields: RefField[] = [];

  for (const [property, def] of Object.entries(properties)) {
    if (typeof def["x-ref"] === "string") {
      fields.push({ property, targetType: def["x-ref"] as EntityType, isArray: false });
      continue;
    }
    const items = def.items as Record<string, unknown> | undefined;
    if (items && typeof items["x-ref"] === "string") {
      fields.push({ property, targetType: items["x-ref"] as EntityType, isArray: true });
    }
  }

  return fields;
}

/**
 * Verifies every reference field on every validated entity points at an ID
 * that actually exists among the entities of the target type. Self-references
 * (e.g. a district's own id, in its own connections list) are allowed.
 */
export function resolveReferences(
  entities: ValidatedEntity[],
  refFieldsByType: Map<EntityType, RefField[]>,
): CompilerError[] {
  const errors: CompilerError[] = [];
  const idsByType = new Map<EntityType, Set<string>>();
  for (const entity of entities) {
    if (!idsByType.has(entity.type)) idsByType.set(entity.type, new Set());
    idsByType.get(entity.type)!.add(entity.id);
  }

  for (const entity of entities) {
    const refFields = refFieldsByType.get(entity.type) ?? [];
    for (const field of refFields) {
      const value = entity.data[field.property];
      if (value === undefined) continue;

      const targetIds = idsByType.get(field.targetType) ?? new Set();
      const check = (refId: unknown) => {
        if (typeof refId !== "string") return;
        if (!targetIds.has(refId)) {
          errors.push({
            kind: "unresolved-reference",
            file: entity.file,
            message: `"${field.property}" references unknown ${field.targetType} "${refId}"`,
          });
        }
      };

      if (field.isArray && Array.isArray(value)) {
        value.forEach(check);
      } else if (!field.isArray) {
        check(value);
      }
    }
  }

  return errors;
}
