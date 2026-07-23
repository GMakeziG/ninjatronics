// Command execution/dispatch — separate from parsing (parseCommand.ts)
// and from the registry itself (terminalCommands.ts). Ties the two
// together and owns the "command not found" fallback.

import { parseCommand } from "./parseCommand.js";
import { getTerminalCommand, type TerminalCommandContext } from "./terminalCommands.js";

const UNKNOWN_COMMAND_OUTPUT = ['Unknown command.', 'Type "help" for available commands.'];

export function runTerminalCommand(input: string, context: TerminalCommandContext): string[] {
  const parsed = parseCommand(input);
  if (!parsed) return [];

  const command = getTerminalCommand(parsed.name);
  if (!command) return UNKNOWN_COMMAND_OUTPUT;

  return command.run(parsed.args, context);
}
