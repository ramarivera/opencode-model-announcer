# Release Process

This project uses Release Please for automated releases.

## Release Workflow

### Conventional Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `fix:` patches
- `feat:` minor features
- `feat!:` or `fix!:` breaking changes

### Pre-1.0 Versioning

While version is `0.x.x`, breaking changes bump **minor** version.

### Release Process

1. Push commits to `main` branch
2. Release Please will:
   - Analyze commits
   - Determine version bump
   - Update `package.json`
   - Update `CHANGELOG.md`
   - Create a release PR

3. Review and merge the Release Please PR

### Commit Message Examples

- `fix: resolve task tracking issue`
- `feat: add global task support`
- `feat!: change task management API`
- `docs: improve README`
- `chore: update dependencies`

## Do Not

- Manually edit Release Please PRs
- Manually create GitHub releases
- Modify version numbers directly

## Publishing

Releases are automatically published to NPM when the Release Please PR is merged.