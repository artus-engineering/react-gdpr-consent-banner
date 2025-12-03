# Publish Script

This script automates the process of publishing a new version of the library to npm.

## Usage

### Basic Usage

```bash
# Publish a patch version to npmjs.com
pnpm publish:npmjs

# Publish a patch version to GitHub Packages
pnpm publish:github

# Dry run (preview what would happen)
pnpm publish:dry
```

### Advanced Usage

```bash
# Direct script usage with options
node scripts/publish.js <version-type> <registry> [flags]

# Version types:
#   - patch (default): 0.1.5 -> 0.1.6
#   - minor: 0.1.5 -> 0.2.0
#   - major: 0.1.5 -> 1.0.0
#   - prerelease: 0.1.5 -> 0.1.5-beta.1 (or increments existing prerelease)
#   - custom: 1.2.3 (exact version)

# Registries:
#   - npmjs (default): https://registry.npmjs.org/
#   - github: https://npm.pkg.github.com

# Flags:
#   --skip-tests: Skip running tests
#   --skip-build: Skip building the library
#   --dry-run: Preview changes without making them
```

## Examples

```bash
# Publish patch version to npmjs
node scripts/publish.js patch npmjs

# Publish minor version to npmjs
node scripts/publish.js minor npmjs

# Publish major version to npmjs
node scripts/publish.js major npmjs

# Publish prerelease version
node scripts/publish.js prerelease npmjs

# Publish specific version
node scripts/publish.js 1.0.0 npmjs

# Dry run to see what would happen
node scripts/publish.js patch npmjs --dry-run

# Skip tests and build (if already done)
node scripts/publish.js patch npmjs --skip-tests --skip-build
```

## What the Script Does

1. **Runs Tests**: Executes `pnpm test` to ensure all tests pass
2. **Lints Code**: Runs `pnpm lint` to check for linting errors
3. **Builds Library**: Executes `pnpm build` to create distribution files
4. **Updates Version**: Updates the version in `package.json`
5. **Publishes**: Publishes to the specified npm registry

## Prerequisites

- You must be logged in to npm:
  ```bash
  npm login --registry=https://registry.npmjs.org/
  # or
  npm login --registry=https://npm.pkg.github.com
  ```

- For GitHub Packages, ensure your `.npmrc` is configured correctly
- All tests must pass
- Code must pass linting
- Build must succeed

## Notes

- The script will temporarily remove `publishConfig` when publishing to npmjs.com to avoid conflicts
- For scoped packages on npmjs.com, use `--access public` (automatically added)
- The script restores the original `publishConfig` after publishing

