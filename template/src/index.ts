/**
 * OpenCode Plugin Template
 *
 * This is an example plugin that demonstrates the plugin capabilities:
 * - Custom tools (tools callable by the LLM)
 * - Custom slash commands (user-invokable /commands loaded from .md files)
 * - Config hooks (modify config at runtime)
 *
 * Replace this with your own plugin implementation.
 */

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';
import path from 'path';

// ============================================================
// COMMAND LOADER
// Loads .md files from src/command/ directory as slash commands
// ============================================================

interface CommandFrontmatter {
  description?: string;
  agent?: string;
  model?: string;
  subtask?: boolean;
}

interface ParsedCommand {
  name: string;
  frontmatter: CommandFrontmatter;
  template: string;
}

/**
 * Parse YAML frontmatter from a markdown file
 * Format:
 * ---
 * description: Command description
 * agent: optional-agent
 * ---
 * Template content here
 */
function parseFrontmatter(content: string): { frontmatter: CommandFrontmatter; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content.trim() };
  }

  const [, yamlContent, body] = match;
  const frontmatter: CommandFrontmatter = {};

  // Simple YAML parsing for key: value pairs
  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'description') frontmatter.description = value;
    if (key === 'agent') frontmatter.agent = value;
    if (key === 'model') frontmatter.model = value;
    if (key === 'subtask') frontmatter.subtask = value === 'true';
  }

  return { frontmatter, body: body.trim() };
}

/**
 * Load all command .md files from the command directory
 */
async function loadCommands(): Promise<ParsedCommand[]> {
  const commands: ParsedCommand[] = [];
  const commandDir = path.join(import.meta.dir, 'command');
  const glob = new Bun.Glob('**/*.md');

  for await (const file of glob.scan({ cwd: commandDir, absolute: true })) {
    const content = await Bun.file(file).text();
    const { frontmatter, body } = parseFrontmatter(content);

    // Extract command name from filename (e.g., "hello.md" -> "hello")
    const relativePath = path.relative(commandDir, file);
    const name = relativePath.replace(/\.md$/, '').replace(/\//g, '-');

    commands.push({
      name,
      frontmatter,
      template: body,
    });
  }

  return commands;
}

export const ExamplePlugin: Plugin = async () => {
  // ============================================================
  // LOAD COMMANDS FROM .MD FILES
  // Commands are loaded at plugin initialization time
  // ============================================================
  const commands = await loadCommands();

  // ============================================================
  // EXAMPLE TOOL
  // Tools are callable by the LLM during conversations
  // ============================================================
  const exampleTool = tool({
    description: 'An example tool that echoes back the input message',
    args: {
      message: tool.schema.string().describe('The message to echo'),
    },
    async execute(args) {
      return `Echo: ${args.message}`;
    },
  });

  return {
    // Register custom tools
    tool: {
      example_tool: exampleTool,
    },

    // ============================================================
    // CONFIG HOOK
    // Modify config at runtime - use this to inject custom commands
    // ============================================================
    async config(config) {
      // Initialize the command record if it doesn't exist
      config.command = config.command ?? {};

      // Register all loaded commands
      for (const cmd of commands) {
        config.command[cmd.name] = {
          template: cmd.template,
          description: cmd.frontmatter.description,
          agent: cmd.frontmatter.agent,
          model: cmd.frontmatter.model,
          subtask: cmd.frontmatter.subtask,
        };
      }
    },
  };
};
