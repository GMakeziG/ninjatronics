import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadJsonFile } from "../world-compiler/load.js";
import type { MergedRepository } from "./types.js";

const FIELD_ORDER = ["id", "githubRepository", "treeName", "districtId", "story", "technologies"];

/**
 * Emits known fields first in a stable order, then any remaining keys
 * alphabetically. Keeps re-runs byte-stable so key order alone never
 * produces a spurious diff between syncs.
 */
export function orderFields(obj: Record<string, unknown>): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  for (const key of FIELD_ORDER) {
    if (key in obj) ordered[key] = obj[key];
  }
  for (const key of Object.keys(obj).sort()) {
    if (!(key in ordered)) ordered[key] = obj[key];
  }
  return ordered;
}

export function serializeEntity(relPath: string, data: Record<string, unknown>): string {
  return `// content/${relPath}\n${JSON.stringify(orderFields(data), null, 2)}\n`;
}

export type WriteAction = "create" | "update" | "unchanged";

export interface WritePlanEntry {
  id: string;
  relPath: string;
  absPath: string;
  action: WriteAction;
  before?: Record<string, unknown>;
  after: Record<string, unknown>;
}

/**
 * Decides create/update/unchanged for each merged repository by comparing
 * against whatever content/repositories/<id>.json currently contains (if
 * anything). Comparison is by value (JSON.stringify of ordered fields), not
 * raw file text, so pre-existing formatting/key-order never triggers a false
 * "update".
 */
export function planWrite(contentRepositoriesDir: string, merged: MergedRepository[]): WritePlanEntry[] {
  return merged.map((entity) => {
    const id = entity.id;
    const relPath = `repositories/${id}.json`;
    const absPath = join(contentRepositoriesDir, `${id}.json`);
    const after = orderFields(entity);

    if (!statSync(absPath, { throwIfNoEntry: false })?.isFile()) {
      return { id, relPath, absPath, action: "create", after };
    }

    let before: Record<string, unknown> | undefined;
    let parseFailed = false;
    try {
      before = orderFields(loadJsonFile(absPath) as Record<string, unknown>);
    } catch {
      parseFailed = true;
    }

    const action: WriteAction =
      parseFailed || JSON.stringify(before) !== JSON.stringify(after) ? "update" : "unchanged";

    return { id, relPath, absPath, action, before, after };
  });
}

/**
 * Lists content/repositories/*.json files that no longer correspond to any
 * kept (fetched and non-skipped) repository id. Purely informational — this
 * function never deletes anything; orphan cleanup is a human decision.
 */
export function findOrphans(contentRepositoriesDir: string, keptIds: string[]): string[] {
  if (!statSync(contentRepositoriesDir, { throwIfNoEntry: false })?.isDirectory()) return [];

  const kept = new Set(keptIds);
  const orphans: string[] = [];
  for (const entry of readdirSync(contentRepositoriesDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const id = entry.name.slice(0, -".json".length);
    if (!kept.has(id)) orphans.push(`repositories/${entry.name}`);
  }
  return orphans;
}
