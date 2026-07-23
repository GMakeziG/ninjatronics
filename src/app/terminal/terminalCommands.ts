// The command registry — the single place new Terminal commands are
// added. runTerminalCommand.ts (dispatch) and Terminal.tsx (UI) both read
// this list; neither hardcodes a command name anywhere else. Adding a
// command later means adding one entry here, not touching the terminal
// component.

import { getNavigationCommand } from "../navigation/navigationCommands.js";
import { getMissionBrief } from "../../lib/mission-brief.js";
import { getGitForest, getRepositoryTree, getRepositoryArtifactPath } from "../../lib/git-forest.js";
import type { RepositoryTree } from "../../lib/git-forest.js";
import { getCertificationArtifactPath } from "../../lib/floating-citadel.js";
import { world, getCertification } from "../../lib/world.js";
import type { Certification } from "../../lib/world.js";
import { groupSkillsByCategory } from "../../lib/skills-overview.js";

export interface TerminalCommandContext {
  navigate: (path: string) => void;
  clear: () => void;
  close: () => void;
}

export interface TerminalCommand {
  name: string;
  summary: string;
  run: (args: string[], context: TerminalCommandContext) => string[];
}

/**
 * Terminal-facing wording for navigation destinations, resolved against
 * the existing navigation command registry (navigationCommands.ts) by id
 * — this is the only place that maps typed words to that registry, so
 * "do not duplicate navigation logic" holds: the actual id/path/label data
 * still lives in exactly one place.
 */
const GOTO_ALIASES: Record<string, string> = {
  home: "home",
  gate: "home",
  valley: "valley",
  world: "valley",
  brief: "mission-brief",
  mission: "mission-brief",
  "git-forest": "git-forest",
  forest: "git-forest",
  "floating-citadel": "floating-citadel",
  citadel: "floating-citadel",
};

const DESTINATION_HINT =
  "Destinations: gate (home), valley (world), brief (mission), git-forest (forest), floating-citadel (citadel)";

function runGoto(args: string[], context: TerminalCommandContext): string[] {
  const target = args[0]?.toLowerCase();
  if (!target) {
    return ["Usage: goto <destination>", DESTINATION_HINT];
  }

  const commandId = GOTO_ALIASES[target];
  const command = commandId ? getNavigationCommand(commandId) : undefined;
  if (!command) {
    return [`Unknown destination "${target}".`, DESTINATION_HINT];
  }

  context.navigate(command.path);
  return [`Navigating to ${command.label}...`];
}

/** Strips everything but lowercase letters/digits — used to compare
 * typed input against real id/name fields regardless of hyphens, spaces,
 * or punctuation (e.g. "az-104" vs "az 104" vs the "(AZ-104)" embedded in
 * a certification's real name). */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function kebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function repositoryListHint(): string {
  return `Repositories: ${getGitForest().trees.map((tree) => tree.id).join(", ")}`;
}

function certificationListHint(): string {
  return `Certifications: ${world.certifications.map((cert) => cert.id).join(", ")}`;
}

/**
 * Resolves user input to a real repository two ways: the real slug/id
 * directly ("lab", "go-practice"), or — "optionally, where unambiguous" —
 * a kebab-cased match against the repository's lore name ("the ancient
 * oak" / "the-ancient-oak" → "lab"). Both `repo` and `open` call this same
 * function rather than each re-implementing repository lookup.
 */
function findRepository(args: string[]): RepositoryTree | undefined {
  if (args.length === 0) return undefined;

  const direct = getRepositoryTree(args[0].toLowerCase());
  if (direct) return direct;

  const loreSlug = kebabCase(args.join(" "));
  return getGitForest().trees.find((tree) => kebabCase(tree.treeName) === loreSlug);
}

/**
 * Resolves user input to a real certification: the real id directly, or a
 * normalized substring match against the id/name — this is what makes
 * exam-code shorthand like "az-104" or "gh-900" (both embedded in the
 * certification's real `name`, e.g. "... (AZ-104)") and "security-plus"
 * (a substring of "CompTIA Security+") resolve without a hardcoded alias
 * table. Both `cert` and `open` call this same function.
 */
function findCertification(args: string[]): Certification | undefined {
  if (args.length === 0) return undefined;

  const direct = getCertification(args[0].toLowerCase());
  if (direct) return direct;

  const needle = normalize(args.join(" "));
  if (!needle) return undefined;

  return world.certifications.find(
    (cert) => normalize(cert.id).includes(needle) || normalize(cert.name).includes(needle),
  );
}

function runRepo(args: string[], context: TerminalCommandContext): string[] {
  if (args.length === 0) {
    return ["Usage: repo <name>", repositoryListHint()];
  }

  const repo = findRepository(args);
  if (!repo) {
    return [`Unknown repository "${args.join(" ")}".`, repositoryListHint()];
  }

  context.navigate(getRepositoryArtifactPath(repo));
  return [`Opening ${repo.treeName}...`];
}

function runCert(args: string[], context: TerminalCommandContext): string[] {
  if (args.length === 0) {
    return ["Usage: cert <name>", certificationListHint()];
  }

  const cert = findCertification(args);
  if (!cert) {
    return [`Unknown certification "${args.join(" ")}".`, certificationListHint()];
  }

  const path = getCertificationArtifactPath(cert);
  if (!path) {
    return [`"${cert.name}" has no district assigned yet — nowhere to open.`];
  }

  context.navigate(path);
  return [`Opening ${cert.name}...`];
}

/**
 * "open" tries a district destination first (the same GOTO_ALIASES map
 * "goto" uses), then a repository, then a certification — one verb for
 * "open <anything real>," without teaching "goto" itself about
 * repositories/certifications or duplicating any of the three resolution
 * paths (each already exists as its own function above).
 */
function runOpen(args: string[], context: TerminalCommandContext): string[] {
  const target = args[0]?.toLowerCase();
  if (!target) {
    return ["Usage: open <destination-or-repository-or-certification>", DESTINATION_HINT];
  }

  const commandId = GOTO_ALIASES[target];
  const destination = commandId ? getNavigationCommand(commandId) : undefined;
  if (destination) {
    context.navigate(destination.path);
    return [`Navigating to ${destination.label}...`];
  }

  const repo = findRepository(args);
  if (repo) {
    context.navigate(getRepositoryArtifactPath(repo));
    return [`Opening ${repo.treeName}...`];
  }

  const cert = findCertification(args);
  if (cert) {
    const path = getCertificationArtifactPath(cert);
    if (path) {
      context.navigate(path);
      return [`Opening ${cert.name}...`];
    }
  }

  return [
    `Unknown destination, repository, or certification "${args.join(" ")}".`,
    DESTINATION_HINT,
    repositoryListHint(),
    certificationListHint(),
  ];
}

function runProfile(): string[] {
  const brief = getMissionBrief();
  const lines = [brief.profile.name, brief.profile.title, brief.profile.tagline, brief.contact.location].filter(
    (value): value is string => !!value,
  );

  return lines.length > 0 ? lines : ["No profile data available."];
}

function runSkills(): string[] {
  const groups = groupSkillsByCategory(getMissionBrief().skills);
  if (groups.length === 0) return ["No skills catalogued yet."];

  return groups.map((group) => `${group.category} (${group.skills.length}): ${group.skills.map((s) => s.name).join(", ")}`);
}

function runCertifications(): string[] {
  const certifications = getMissionBrief().certifications;
  if (certifications.length === 0) return ["No certifications recorded yet."];

  return certifications.map((certification) => `${certification.name} — ${certification.issuer}`);
}

function runRepos(): string[] {
  const trees = getGitForest().trees;
  if (trees.length === 0) return ["No repositories synced yet."];

  return trees.map((tree) => `${tree.treeName} (${tree.githubRepository})`);
}

export const TERMINAL_COMMANDS: TerminalCommand[] = [
  {
    name: "help",
    summary: "List available commands.",
    run: () => TERMINAL_COMMANDS.map((command) => `${command.name.padEnd(15)} ${command.summary}`),
  },
  {
    name: "clear",
    summary: "Clear the terminal output.",
    run: (_args, context) => {
      context.clear();
      return [];
    },
  },
  {
    name: "exit",
    summary: "Close the terminal.",
    run: (_args, context) => {
      context.close();
      return [];
    },
  },
  {
    name: "goto",
    summary: 'Navigate to a place, e.g. "goto valley" or "goto git-forest".',
    run: runGoto,
  },
  {
    name: "open",
    summary: 'Navigate to a place, repository, or certification, e.g. "open citadel" or "open az-104".',
    run: runOpen,
  },
  {
    name: "repo",
    summary: 'Open a repository\'s page, e.g. "repo lab".',
    run: runRepo,
  },
  {
    name: "cert",
    summary: 'Open a certification\'s page, e.g. "cert az-104".',
    run: runCert,
  },
  {
    name: "profile",
    summary: "Show the profile summary.",
    run: runProfile,
  },
  {
    name: "skills",
    summary: "Show skills grouped by category.",
    run: runSkills,
  },
  {
    name: "certifications",
    summary: "Show certifications.",
    run: runCertifications,
  },
  {
    name: "repos",
    summary: "Show synced repositories.",
    run: runRepos,
  },
];

export function getTerminalCommand(name: string): TerminalCommand | undefined {
  return TERMINAL_COMMANDS.find((command) => command.name === name);
}
