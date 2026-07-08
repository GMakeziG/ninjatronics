import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { ContentFile } from "./types.js";

/**
 * Recursively finds every .json file under contentDir. The "folder" for each
 * file is the top-level directory it lives under (content/<folder>/...),
 * regardless of how deeply it is nested beneath that — so an Obsidian-style
 * vault of nested note folders still maps to the "notes" domain.
 */
export function discoverContentFiles(contentDir: string): ContentFile[] {
  const files: ContentFile[] = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const absPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        const relPath = relative(contentDir, absPath).split(sep).join("/");
        const folder = relPath.split("/")[0];
        files.push({ absPath, relPath, folder });
      }
    }
  };

  if (statSync(contentDir, { throwIfNoEntry: false })?.isDirectory()) {
    walk(contentDir);
  }

  return files;
}
