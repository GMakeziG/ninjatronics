// Parsing only — no knowledge of what commands exist or how they execute.
// Kept separate from terminalCommands.ts (the registry) and
// runTerminalCommand.ts (dispatch) per this feature's own architecture
// requirement: UI, parsing, and execution stay in different modules.

export interface ParsedCommand {
  name: string;
  args: string[];
}

export function parseCommand(input: string): ParsedCommand | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const [name, ...args] = trimmed.split(/\s+/);
  return { name: name.toLowerCase(), args };
}
