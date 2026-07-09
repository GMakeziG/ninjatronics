import type { NormalizeError } from "./types.js";
import type { WritePlanEntry } from "./write.js";

const color = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function diffKeys(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const lines: string[] = [];
  for (const key of keys) {
    const from = JSON.stringify(before[key]);
    const to = JSON.stringify(after[key]);
    if (from !== to) lines.push(`    ${color.yellow("~")} ${key}: ${color.dim(from ?? "(absent)")} -> ${to ?? "(absent)"}`);
  }
  return lines;
}

export function reportPlan(
  plan: WritePlanEntry[],
  skipped: string[],
  errors: NormalizeError[],
  orphans: string[],
  check: boolean,
): void {
  const counts = {
    create: plan.filter((e) => e.action === "create").length,
    update: plan.filter((e) => e.action === "update").length,
    unchanged: plan.filter((e) => e.action === "unchanged").length,
    skipped: skipped.length,
    errors: errors.length,
    orphans: orphans.length,
  };

  console.log(color.bold("\nGitHub repository sync\n"));
  for (const [label, count] of Object.entries(counts)) {
    console.log(`  ${color.dim(label.padEnd(10))} ${count}`);
  }

  for (const entry of plan) {
    if (entry.action === "unchanged") continue;
    const tag = entry.action === "create" ? color.green("+ create") : color.yellow("~ update");
    console.log(`\n  ${tag} content/${entry.relPath}`);
    if (entry.action === "update" && entry.before) {
      for (const line of diffKeys(entry.before, entry.after)) console.log(line);
    }
  }

  if (skipped.length > 0) {
    console.log(color.dim(`\n  skipped (override skip:true): ${skipped.join(", ")}`));
  }

  if (errors.length > 0) {
    console.error(color.red(color.bold(`\n✗ ${errors.length} error(s):`)));
    for (const err of errors) console.error(`  ${err.repoFullName}: ${err.message}`);
  }

  if (orphans.length > 0) {
    console.log(color.yellow(color.bold("\n⚠ orphaned (not deleted, review manually):")));
    for (const orphan of orphans) console.log(`  content/${orphan}`);
  }

  console.log(check ? color.dim("\n(check only, nothing written)\n") : color.green("\nDone.\n"));
}
