/**
 * OpenCode Plugin Template
 * 
 * This is a minimal example plugin that demonstrates the basic structure
 * of an OpenCode plugin with a single tool.
 * 
 * Replace this with your own plugin implementation.
 */

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';

export const ExamplePlugin: Plugin = async () => {
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
    tool: {
      example_tool: exampleTool,
    },
  };
};
