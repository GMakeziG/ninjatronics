import { readFileSync } from "node:fs";

/**
 * Content files may start with a leading "// path/to/file.json" comment line
 * (used as a human-readable file-path breadcrumb). Strip any line whose first
 * non-whitespace characters are "//" before parsing. This deliberately does
 * NOT touch "//" that appears mid-line (e.g. inside a URL string), since it
 * only ever matches whole comment lines.
 */
export function stripLeadingLineComments(source: string): string {
  return source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
}

export class JsonParseError extends Error {}

export function parseJsonc(source: string): unknown {
  try {
    return JSON.parse(stripLeadingLineComments(source));
  } catch (err) {
    throw new JsonParseError(err instanceof Error ? err.message : String(err));
  }
}

export function loadJsonFile(absPath: string): unknown {
  const source = readFileSync(absPath, "utf8");
  return parseJsonc(source);
}
