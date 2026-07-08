import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { ENTITY_REGISTRY } from "./registry.js";

export interface SchemaBundle {
  ajv: Ajv;
  validators: Map<string, ValidateFunction>;
  /** Raw parsed schema JSON per schema filename, used to read x-ref metadata. */
  rawSchemas: Map<string, Record<string, unknown>>;
}

/**
 * Loads every entity schema plus the composed world schema into a single Ajv
 * instance so world.schema.json's $ref lookups resolve against them.
 */
export function loadSchemas(schemasDir: string): SchemaBundle {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validators = new Map<string, ValidateFunction>();
  const rawSchemas = new Map<string, Record<string, unknown>>();
  const entitiesDir = join(schemasDir, "entities");

  for (const file of readdirSync(entitiesDir)) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(entitiesDir, file), "utf8"));
    rawSchemas.set(file, raw);
    ajv.addSchema(raw, file);
  }

  for (const entry of ENTITY_REGISTRY) {
    const validator = ajv.getSchema(entry.schemaFile);
    if (!validator) {
      throw new Error(
        `No compiled schema found for "${entry.schemaFile}" (registered for content/${entry.folder}/). ` +
          `Add schemas/entities/${entry.schemaFile}.`,
      );
    }
    validators.set(entry.type, validator);
  }

  const worldSchemaRaw = JSON.parse(readFileSync(join(schemasDir, "world.schema.json"), "utf8"));
  ajv.addSchema(worldSchemaRaw, "world.schema.json");
  validators.set("world", ajv.getSchema("world.schema.json")!);

  return { ajv, validators, rawSchemas };
}

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) return "unknown validation error";
  return errors
    .map((err) => {
      const path = err.instancePath || "(root)";
      return `${path} ${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ""}`;
    })
    .join("; ");
}
