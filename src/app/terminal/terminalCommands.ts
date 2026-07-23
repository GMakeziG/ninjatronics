// The command registry — the single place new Terminal commands are
// added. runTerminalCommand.ts (dispatch) and Terminal.tsx (UI) both read
// this list; neither hardcodes a command name anywhere else. Adding a
// command later means adding one entry here, not touching the terminal
// component.

import { getNavigationCommand } from "../navigation/navigationCommands.js";
import { getMissionBrief } from "../../lib/mission-brief.js";
import { getGitForest } from "../../lib/git-forest.js";
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
};

const DESTINATION_HINT = "Destinations: gate (home), valley (world), brief (mission), git-forest (forest)";

/** Shared by both "goto" and "open" — "open <district>" reads naturally
 * for entering a place, but it's the same destination resolution and the
 * same navigate() call, so it's one function registered under two command
 * names rather than two implementations. */
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
    summary: 'Alias of "goto", e.g. "open git-forest".',
    run: runGoto,
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
