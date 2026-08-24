# CI (GitHub Actions)

Runner: `artus-arm64-runners` (ARC) for private `artus-engineering/*` repos. Cross-project tooling: [Repository Tooling (SonarQube, CI, Cursor Agents)](https://github.com/artus-engineering/agency-portal/blob/main/docs/dev-tooling.md) — also in the Artus portal wiki under SWE → Wissen → Software Engineering.

## Workflows

| File | Purpose |
| --- | --- |
| `.github/workflows/branch.yaml` | Lint, build, tests, visual regression → SonarQube scan → quality gate |

## Required checks

After rollout, enable on `main`:

- **Tests**
- **SonarQube Scan**
- **SonarQube Quality Gate**

Secrets: `SONAR_TOKEN`, `SONAR_HOST_URL`.

## ARC notes

- `libatomic1` before `setup-node` on jobs that run Node
- Sonar scan job: `dirmngr`, `gnupg`, `locales`, Node, UTF-8 `LANG` / `SONAR_SCANNER_OPTS`

See [agency-portal docs/ci.md](https://github.com/artus-engineering/agency-portal/blob/main/docs/ci.md) for details.
