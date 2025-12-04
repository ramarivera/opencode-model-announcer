# OpenCode Plugin Template Generator

🎉 Generate a new OpenCode plugin in seconds!

This is a generator repository for creating new [OpenCode](https://opencode.ai) plugins. It provides a starter template with all the scaffolding you need to build powerful OpenCode plugins.

## Quick Start

### 1. Use this template

Click "Use this template" on GitHub or clone it:

```bash
git clone https://github.com/zenobi-us/opencode-plugin-template.git my-plugin
cd my-plugin
```

### 2. Run the generator

```bash
bunx plop
```

Or if you prefer npm/yarn:

```bash
npm install
npm run generate
```

### 3. Answer the prompts

The generator will ask for:

- **Plugin name** - kebab-case identifier (e.g., `my-awesome-plugin`)
- **Description** - What your plugin does
- **Author name** - Your name
- **Author email** - Your email
- **Repository URL** - GitHub repo URL
- **GitHub org/username** - For workflow configuration

### 4. Start developing!

```bash
cd my-plugin
bun install
mise run build
```

## What You Get

After running the generator, you'll have:

- ✅ TypeScript setup with modern tooling
- ✅ ESLint + Prettier configuration
- ✅ GitHub Actions workflows (build, lint, release)
- ✅ OpenCode plugin scaffolding
- ✅ Ready-to-use test setup
- ✅ Clean git history with initial commit

The generator cleans itself up - no template files or generator code left behind!

## Project Structure

Generated plugins have this structure:

```
my-plugin/
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── version.ts        # Version info
│   └── commands/         # Your plugin commands
├── .github/
│   └── workflows/        # CI/CD workflows
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config
└── README.md             # Your plugin's documentation
```

## Development

### Available Scripts

```bash
bun install          # Install dependencies
mise run build       # Build the plugin
mise run format      # Format code
mise run lint        # Lint code
mise run test        # Run tests
mise run dev         # Watch mode for development
```

### Publishing

Your plugin is set up for publishing to npm with:

```bash
bun run build
npm publish
```

See [package.json](template/package.json) for full details on the plugin template.

## Learn More

- [OpenCode Documentation](https://opencode.ai/docs)
- [Plugin Development Guide](https://opencode.ai/docs/plugins)
- [OpenCode GitHub](https://github.com/opencode-ai/opencode)

## License

MIT

## Support

Need help?

- Check the [OpenCode docs](https://opencode.ai/docs)
- Open an issue on [GitHub](https://github.com/zenobi-us/opencode-plugin-template/issues)
- Report bugs at https://github.com/sst/opencode
