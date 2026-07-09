import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { JsonParseError, parseJsonc } from "../world-compiler/load.js";
import type { RepositoryOverride } from "./types.js";

/**
 * Loads hand-authored partial patches from content-overrides/repositories/<id>.json.
 * This directory is deliberately outside content/, so the World Compiler's
 * discover.ts never walks it and it needs no schema/registry entry — these files
 * are intentionally incomplete (e.g. just districtId + treeName), unlike a full
 * repository entity.
 */
export function loadOverrides(overridesRepositoriesDir: string): Map<string, RepositoryOverride> {
  const overrides = new Map<string, RepositoryOverride>();

  if (!statSync(overridesRepositoriesDir, { throwIfNoEntry: false })?.isDirectory()) {
    return overrides;
  }

  for (const entry of readdirSync(overridesRepositoriesDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const id = entry.name.slice(0, -".json".length);
    const absPath = join(overridesRepositoriesDir, entry.name);

    let parsed: unknown;
    try {
      parsed = parseJsonc(readFileSync(absPath, "utf8"));
    } catch (err) {
      throw new JsonParseError(
        `Failed to parse override file content-overrides/repositories/${entry.name}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    overrides.set(id, parsed as RepositoryOverride);
  }

  return overrides;
}
