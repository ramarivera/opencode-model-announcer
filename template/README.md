# {{pluginName}}

{{description}}

> An OpenCode plugin created from the [opencode-plugin-template](https://github.com/zenobi-us/opencode-plugin-template)

## Features

- 🏗️ TypeScript-based plugin architecture
- 🔧 Mise task runner integration
- 📦 Bun/npm build tooling
- ✨ ESLint + Prettier formatting
- 🧪 Vitest testing setup
- 🚀 GitHub Actions CI/CD
- 📝 Release automation with release-please

## Getting Started

1. **Clone this template:**

   ```bash
   cp -r opencode-plugin-template your-plugin-name
   cd your-plugin-name
   ```

2. **Update package.json:**
   - Change `name` to your plugin name
   - Update `description`
   - Update `repository.url`

3. **Install dependencies:**

   ```bash
   bun install
   ```

4. **Implement your plugin in `src/index.ts`:**

   ```typescript
   import type { Plugin } from '@opencode-ai/plugin';

   export const YourPlugin: Plugin = async (ctx) => {
     return {
       tool: {
         // Your plugin tools here
       },
     };
   };
   ```

5. **Test your plugin:**
   ```bash
   mise run test
   ```

## Development

- `mise run build` - Build the plugin
- `mise run test` - Run tests
- `mise run lint` - Lint code
- `mise run lint:fix` - Fix linting issues
- `mise run format` - Format code with Prettier

## Installation in OpenCode

Create or edit `~/.config/opencode/config.json`:

```json
{
  "plugins": ["{{pluginName}}"]
}
```

## Author

{{authorName}} <{{authorEmail}}>

## Repository

{{repositoryUrl}}

## Contributing

Contributions are welcome! Please file issues or submit pull requests on the GitHub repository.

## License

MIT License. See the [LICENSE](LICENSE) file for details.
