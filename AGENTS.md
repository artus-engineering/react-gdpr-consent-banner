# AGENTS.md

Canonical contributor and AI-agent guide for `@artus_engineering/react-gdpr-cookie-consent`. Cursor rules in `.cursor/rules/*.mdc` point here; keep this file as the single source of truth.

## Repository map

- `src/` — published library source. `src/index.ts` is the only public barrel.
- `src/components/` — React components (`consent/`, `cookies/`, `general/`).
- `src/hooks.ts`, `src/consentHooks.ts` — public React hooks and consent-hook factories.
- `src/themes.ts`, `src/functions.ts`, `src/auditService.ts`, `src/types.d.ts` — themes, helpers, audit service, types.
- `src/test-utils/` — shared fixtures for Jest tests and Storybook stories. Not shipped.
- `.storybook/` — Storybook config, Tailwind wiring, shared decorators.
- `tests/visual/` — Playwright visual regression tests + committed baselines.
- `example/` — Next.js example app that consumes the library via `file:..`.

## Public API contract

Anything exported from `src/index.ts` is part of the supported API. When adding or changing such an export:

1. Add or update a Jest test (`*.test.ts` / `*.test.tsx`) co-located with the source.
2. Add or update a Storybook story (`*.stories.tsx`) co-located with the source for user-facing components.
3. Update the `example/` app so the new prop / hook / factory is demonstrated in a route or component.
4. Re-export new public types from `src/types.d.ts` via `src/index.ts`.
5. Keep `src/test-utils/**` out of `src/index.ts`.

If you remove or rename a public symbol, search the repo for usages (`rg`), update `example/`, and call it out in the PR description — this is a breaking change.

## Testing

Jest (jsdom) runs behavior tests. Playwright runs visual tests against a built Storybook.

### Jest rules

- New `src/**/*.ts` logic requires a `*.test.ts`; new components require a `*.test.tsx`.
- Use `@testing-library/react` and `@testing-library/user-event`; prefer queries by role / label over test IDs.
- Reuse fixtures from `src/test-utils/fixtures.ts` instead of inlining cookie providers.
- Clean cookies between tests when asserting on `document.cookie` (see existing tests for the pattern).
- Coverage is tracked in `coverage/lcov.info` and uploaded to SonarQube; do not regress coverage on changed files.

### Dist import smoke test

- `tests/import/test-import.js` runs against the built `dist/` output (CJS + ESM + `.d.ts`) and catches packaging regressions Jest cannot see (missing exports, stray CSS `require`/`import`, missing types).
- Invoked via `pnpm run test:import` (or `pnpm run test:all` for Jest + import). Requires a prior `pnpm run build`.
- CI (`branch.yaml`) and release (`publish.yaml`) both run it.
- When a new public export is added to `src/index.ts`, add it to the `requiredExports` list in `tests/import/test-import.js`.

### Visual test rules

- The Playwright suite in `tests/visual/stories.spec.ts` iterates `storybook-static/index.json` and screenshots every story.
- Baselines live under `tests/visual/stories.spec.ts-snapshots/*-chromium-linux.png` and are generated on Linux for CI parity.
- After adding or changing a story, regenerate baselines in the Playwright Linux container from the repo root:
  ```bash
  docker run --rm --ipc=host -e CI=true -v "$(pwd)":/work -w /work \
    mcr.microsoft.com/playwright:v1.62.0-noble bash -lc \
    "npm i -g pnpm@11.5.0 >/dev/null && pnpm install --frozen-lockfile && \
     pnpm run build-storybook && pnpm run test:visual:update"
  ```
- Review the regenerated PNGs visually before committing. Never commit `-actual.png` / `-diff.png` outputs (ignored by `.gitignore`).
- If a story is intentionally non-deterministic (dates, randomness), stub it in the story file — do not loosen `maxDiffPixelRatio`.

## Storybook

- Storybook 10 + Vite + Tailwind (see `.storybook/main.ts`, `.storybook/preview.ts`).
- Every public component under `src/components/**` has a co-located `*.stories.tsx`.
- Stories use CSF3: `const meta: Meta<typeof X>` + `StoryObj<typeof X>`; default export is the meta.
- Components that call `useStyle` / `useConfig` / `useCookieState` must be wrapped in the `CookieConsentProvider`. Use `withConsentProvider` from `.storybook/decorators.tsx`; configure per-story via `parameters.consent`:
  ```ts
  parameters: {
      consent: {
          includeCookieBanner: false,
          markBannerDismissed: true,
          preSetCookies: { website_consent: 'given' },
          config: { lang: 'enUS' }
      }
  }
  ```
- Reuse `defaultStoryConfig`, `essentialProvider`, `analyticsProvider`, etc. from `src/test-utils/fixtures.ts`. Do not inline ad-hoc providers.
- Scope: one theme (`DefaultTheme`) and one locale (`enUS`) unless the story is specifically exercising theming or i18n.
- Variants should cover default state plus any meaningful interactive state (expanded, gated, disabled). Drive interactive states with a `play` function when the interaction is stable.

## Example app (`example/`)

- Next.js 15 + React 19 app consuming the library as `file:..`.
- When a new prop, hook, or consent-hook factory becomes public, wire it into `example/components/` or a route so the example demonstrates realistic usage.
- Verify `pnpm --dir example run lint` and `pnpm --dir example run build` before opening a PR that touches `example/`.
- Do not commit `example/.env*`; keep `env.example` up to date.

## Conventions

- TypeScript strict; public types live in `src/types.d.ts`.
- Biome owns formatting and linting (`pnpm run lint` / `pnpm run lint:fix`). Do not introduce ESLint/Prettier configs.
- **Lefthook** formats and lints staged files on commit (`lefthook.yml`); installed via `pnpm install` → `prepare`.
- **SonarQube:** SonarLint Connected Mode + MCP `analyze_code_snippet` on changed `*.ts`/`*.tsx`/`*.js`/`*.jsx` before agent commits (see `.cursor/rules/sonarqube_mcp_instructions.mdc`). Lefthook/Biome is not a substitute.
- Cross-project tooling guide: Artus portal wiki **Repository Tooling (SonarQube, CI, Cursor Agents)** or [agency-portal `docs/dev-tooling.md`](https://github.com/artus-engineering/agency-portal/blob/main/docs/dev-tooling.md).
- No comments that narrate code (`// Import X`, `// Set Y`). Keep comments for non-obvious intent, constraints, or trade-offs only.
- Avoid adding emojis to code or comments unless explicitly requested.
- Internal helpers (e.g. `src/constants.ts`, most of `src/functions.ts`) stay internal — do not re-export from `src/index.ts`.

## Commands cheatsheet

```bash
pnpm install                 # workspace install
pnpm run lint                # biome check
pnpm run test                # full suite (unit + import + storybook + visual)
pnpm run test:unit           # jest with coverage (jsdom)
pnpm run test:import         # dist-level smoke test
pnpm run test:all            # jest + import smoke
pnpm run build               # rollup cjs+esm+dts build
pnpm run storybook           # dev Storybook on :6006
pnpm run build-storybook     # produces storybook-static/
pnpm run test:visual         # playwright against built storybook-static/
pnpm run test:visual:update  # regenerate baselines (use Linux container for CI parity)
pnpm --dir example run dev   # run example app
pnpm --dir example run build # verify example still builds
```

## Pre-PR checklist

Run locally before pushing:

- [ ] `pnpm run lint`
- [ ] `pnpm run build`
- [ ] `pnpm run test:all`
- [ ] `pnpm run build-storybook`
- [ ] `pnpm run test:visual` (regenerate baselines in the Linux container if UI changed)
- [ ] `pnpm --dir example run build` when the example or public API changed
- [ ] Stories, tests, and the example app all reflect every public API change

CI (`.github/workflows/branch.yaml`) enforces `lint`, `build`, `test`, `test:import`, visual tests, SonarQube scan, and quality gate on `artus-arm64-runners`. A PR that ships a public-API change without a corresponding story, test, or example update should not be merged.

**Dependabot** runs yearly; weekly dependency maintenance is handled by Cursor Automation.

## Publishing

Releases are driven by GitHub Releases, not local npm scripts. See `.github/workflows/publish.yaml`.

To cut a release:

1. Ensure `main` is green.
2. Create a GitHub Release with a semver tag, e.g. `v1.0.5` (leading `v` is stripped automatically).
3. The workflow sets `package.json` version from the release tag, runs `lint` → `build` → `test:import` → `test:unit` → visual tests, and publishes `@artus_engineering/react-gdpr-cookie-consent` to the public npm registry.

Publishing uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC) via the GitHub connection configured on npmjs.com for `publish.yaml`. No `NPM_TOKEN` secret is required. Do not set `NODE_AUTH_TOKEN` in the publish step — it overrides OIDC authentication.

## Learned User Preferences

- For WordPress work, prefer a ready-to-upload plugin `.zip` pipeline over instructions that require copying generated JavaScript manually.
- For visual UI fixes, controls must be clearly recognizable; off-state switches should use a primary-color shade or outline rather than blending into surrounding cards.

## Learned Workspace Facts

- The repo includes a WordPress plugin wrapper at `wordpress/react-gdpr-cookie-consent` with PHP settings UI and an esbuild-built React frontend bundle.
- The WordPress plugin is intended to be German-only; admin UI, defaults, validation messages, and bundled banner copy should avoid English user-facing text.
- `pnpm run build:wordpress` builds the WordPress frontend bundle and packages `wordpress/react-gdpr-cookie-consent/dist/react-gdpr-cookie-consent.zip` for upload through WordPress admin.
- Built-in WordPress integrations should provide predefined cookie provider metadata automatically; configuring GA, GTM, or Facebook Pixel should not require manual cookie provider entries for those services.
- Release publishing sets `package.json` version from the GitHub Release tag in CI before publishing to npm; the committed version in the repo is informational until the next release.
- Jest has `watchman: false` in `package.json` because local Watchman crawling can hang before test discovery on macOS.
