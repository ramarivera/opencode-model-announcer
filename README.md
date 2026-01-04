# OpenCode Model Announcer Plugin

This plugin automatically injects the current model name into the chat context. This helps the LLM know exactly which model it is (e.g., `google/gemini-3-pro-high` or `anthropic/claude-opus-4-5-thinking`) without needing to ask the user or hallucinating.

## Features

- **Automatic Announcement**: Injects a synthetic message part into every user prompt turn.
- **Context Awareness**: Seen only by the LLM, invisible in the TUI history.
- **Zero Configuration**: Just load the plugin and it works.

## Installation

Add it to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "file:///Users/ramarivera/dev/opencode-model-announcer--ramarivera"
  ]
}
```

## How it Works

The plugin hooks into `experimental.chat.messages.transform`. Right before the messages are sent to the AI provider, it:

1.  Finds the last user message.
2.  Resolves the **friendly model name** (e.g., "Claude 3.5 Sonnet") using the OpenCode SDK.
3.  Prepends a system-level announcement to the user's message:

`[SYSTEM: CURRENT_MODEL_ANNOUNCEMENT - The current model being used is: {friendlyName} ({provider}/{model}). Use this information to tailor your responses if necessary.]`

🤖 _This content was generated with AI assistance using Claude Opus 4.5._
