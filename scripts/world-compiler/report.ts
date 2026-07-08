import type { CompilerError } from "./types.js";

const color = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

export function reportErrors(errors: CompilerError[]): void {
  const byFile = new Map<string, CompilerError[]>();
  for (const err of errors) {
    if (!byFile.has(err.file)) byFile.set(err.file, []);
    byFile.get(err.file)!.push(err);
  }

  console.error(color.red(color.bold(`\n✗ World Compiler found ${errors.length} error(s):\n`)));

  for (const [file, fileErrors] of byFile) {
    console.error(color.bold(file));
    for (const err of fileErrors) {
      console.error(`  ${color.yellow(`[${err.kind}]`)} ${err.message}`);
    }
  }
  console.error();
}

export function reportSuccess(outPath: string, counts: Record<string, number>): void {
  console.log(color.green(color.bold("\n✓ World compiled successfully\n")));
  for (const [collection, count] of Object.entries(counts)) {
    console.log(`  ${color.dim(collection.padEnd(16))} ${count}`);
  }
  console.log(`\n  ${color.dim("→")} ${outPath}\n`);
}
