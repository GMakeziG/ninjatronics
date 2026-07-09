// GitHub repository ingestion service.
//
// Fetches GMakeziG's public, non-fork repositories, normalizes them into
// repository-entity defaults, merges in hand-authored overrides from
// content-overrides/repositories/, and writes content/repositories/*.json.
//
// This script is only ever allowed to produce content/**/*.json — it never
// writes data/world.json. Run `npm run compile:world` afterwards to let the
// World Compiler validate and assemble the result; it remains the single
// source of truth for the compiled world.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchPublicRepos } from "./github-sync/fetch.js";
import { loadOverrides } from "./github-sync/overrides.js";
import { buildMergedRepositories } from "./github-sync/merge.js";
import { planWrite, findOrphans, serializeEntity } from "./github-sync/write.js";
import { reportPlan } from "./github-sync/report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

/**
 * Hardcoded, not a CLI flag: this service only ever ingests GMakeziG's own
 * public repositories, never another user's or an organization's.
 */
const GITHUB_USERNAME = "GMakeziG";

interface CliOptions {
  contentDir: string;
  overridesDir: string;
  check: boolean;
  includeForks: boolean;
  includeArchived: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    contentDir: join(REPO_ROOT, "content"),
    overridesDir: join(REPO_ROOT, "content-overrides"),
    check: false,
    includeForks: false,
    includeArchived: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check" || arg === "--dry-run") options.check = true;
    else if (arg === "--content") options.contentDir = join(process.cwd(), argv[++i]);
    else if (arg === "--overrides") options.overridesDir = join(process.cwd(), argv[++i]);
    else if (arg === "--include-forks") options.includeForks = true;
    else if (arg === "--include-archived") options.includeArchived = true;
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const repos = await fetchPublicRepos({
    username: GITHUB_USERNAME,
    token: process.env.GITHUB_TOKEN,
    includeForks: options.includeForks,
    includeArchived: options.includeArchived,
  });

  const overrides = loadOverrides(join(options.overridesDir, "repositories"));
  const { merged, skipped, errors } = buildMergedRepositories(repos, overrides);

  const contentRepositoriesDir = join(options.contentDir, "repositories");
  const plan = planWrite(contentRepositoriesDir, merged);
  const orphans = findOrphans(
    contentRepositoriesDir,
    merged.map((m) => m.id),
  );

  if (!options.check) {
    for (const entry of plan) {
      if (entry.action === "unchanged") continue;
      mkdirSync(dirname(entry.absPath), { recursive: true });
      writeFileSync(entry.absPath, serializeEntity(entry.relPath, entry.after), "utf8");
    }
  }

  reportPlan(plan, skipped, errors, orphans, options.check);

  if (errors.length > 0) process.exit(1);
}

main();
