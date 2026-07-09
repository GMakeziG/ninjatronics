// The World Compiler: assembles content/**/*.json into a single data/world.json.
//
// Pipeline: discover -> load (JSONC) -> validate (per-type JSON Schema) ->
// resolve (ID references between entities) -> assemble -> write.
//
// This is the foundation for future integrations (GitHub sync, Obsidian vault
// import, the Oracle) — they should all produce content/**/*.json and let this
// compiler do the validating and assembling.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverContentFiles } from "./world-compiler/discover.js";
import { JsonParseError, loadJsonFile } from "./world-compiler/load.js";
import { ENTITY_REGISTRY, findRegistryEntry } from "./world-compiler/registry.js";
import { loadSchemas, formatAjvErrors } from "./world-compiler/validate.js";
import { findRefFields, resolveReferences } from "./world-compiler/resolve.js";
import { checkSingletonCollections, isSingletonSchema } from "./world-compiler/singleton.js";
import { assembleWorld } from "./world-compiler/assemble.js";
import { reportErrors, reportSuccess } from "./world-compiler/report.js";
import type { CompilerError, EntityType, RawEntity, ValidatedEntity } from "./world-compiler/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

interface CliOptions {
  contentDir: string;
  schemasDir: string;
  outFile: string;
  check: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    contentDir: join(REPO_ROOT, "content"),
    schemasDir: join(REPO_ROOT, "schemas"),
    outFile: join(REPO_ROOT, "data", "world.json"),
    check: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check" || arg === "--dry-run") options.check = true;
    else if (arg === "--content") options.contentDir = join(process.cwd(), argv[++i]);
    else if (arg === "--schemas") options.schemasDir = join(process.cwd(), argv[++i]);
    else if (arg === "--out") options.outFile = join(process.cwd(), argv[++i]);
  }

  return options;
}

function compile(options: CliOptions): { errors: CompilerError[]; world?: ReturnType<typeof assembleWorld> } {
  const errors: CompilerError[] = [];
  const schemas = loadSchemas(options.schemasDir);
  const files = discoverContentFiles(options.contentDir);

  const validated: ValidatedEntity[] = [];
  const seenIds = new Map<string, string>(); // "type:id" -> file that first defined it

  for (const file of files) {
    const entry = findRegistryEntry(file.folder);
    if (!entry) {
      errors.push({
        kind: "unknown-folder",
        file: file.relPath,
        message: `No entity type is registered for content/${file.folder}/. Add it to scripts/world-compiler/registry.ts.`,
      });
      continue;
    }

    let raw: RawEntity;
    try {
      raw = loadJsonFile(file.absPath) as RawEntity;
    } catch (err) {
      errors.push({
        kind: "parse",
        file: file.relPath,
        message: err instanceof JsonParseError ? err.message : String(err),
      });
      continue;
    }

    const validator = schemas.validators.get(entry.type)!;
    if (!validator(raw)) {
      errors.push({
        kind: "schema",
        file: file.relPath,
        message: formatAjvErrors(validator.errors),
      });
      continue;
    }

    const id = (raw as { id: string }).id;
    const dedupeKey = `${entry.type}:${id}`;
    const existingFile = seenIds.get(dedupeKey);
    if (existingFile) {
      errors.push({
        kind: "duplicate-id",
        file: file.relPath,
        message: `Duplicate ${entry.type} id "${id}" — already defined in ${existingFile}`,
      });
      continue;
    }
    seenIds.set(dedupeKey, file.relPath);

    validated.push({ type: entry.type, id, file: file.relPath, data: raw as Record<string, unknown> });
  }

  const refFieldsByType = new Map<EntityType, ReturnType<typeof findRefFields>>();
  const singletonTypes = new Set<EntityType>();
  for (const entry of ENTITY_REGISTRY) {
    const rawSchema = schemas.rawSchemas.get(entry.schemaFile);
    if (!rawSchema) continue;
    refFieldsByType.set(entry.type, findRefFields(rawSchema));
    if (isSingletonSchema(rawSchema)) singletonTypes.add(entry.type);
  }

  errors.push(...resolveReferences(validated, refFieldsByType));
  errors.push(...checkSingletonCollections(validated, singletonTypes));

  if (errors.length > 0) {
    return { errors };
  }

  const world = assembleWorld(validated, files.length);

  const worldValidator = schemas.validators.get("world")!;
  if (!worldValidator(world)) {
    errors.push({
      kind: "schema",
      file: "data/world.json",
      message: `Assembled world failed world.schema.json validation: ${formatAjvErrors(worldValidator.errors)}`,
    });
    return { errors };
  }

  return { errors: [], world };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { errors, world } = compile(options);

  if (errors.length > 0) {
    reportErrors(errors);
    process.exit(1);
  }

  const counts = Object.fromEntries(
    Object.entries(world!).filter(([key]) => key !== "meta").map(([key, value]) => [key, (value as unknown[]).length]),
  );

  if (!options.check) {
    mkdirSync(dirname(options.outFile), { recursive: true });
    writeFileSync(options.outFile, JSON.stringify(world, null, 2) + "\n", "utf8");
  }

  reportSuccess(options.check ? `${options.outFile} (check only, not written)` : options.outFile, counts);
}

main();
