# CI (GitHub Actions)

Runner: `ubuntu-latest` (public repo). Cross-project tooling: [Repository Tooling (SonarQube, CI, Cursor Agents)](https://github.com/artus-engineering/agency-portal/blob/main/docs/dev-tooling.md) — also in the Artus portal wiki under SWE → Wissen → Software Engineering.

## Workflows

| File | Purpose |
| --- | --- |
| `.github/workflows/branch.yaml` | Lint, build, tests, visual regression → SonarQube scan → quality gate |

## Required checks

On `main`:

- **Tests**
- **SonarQube Scan**

The quality gate runs inside the **SonarQube Scan** job — a failed gate fails that check.

Secrets: `SONAR_TOKEN`, `SONAR_HOST_URL`.

PRs use the `pull_request` event so tests and Sonar analyze the PR head. `pull_request_target` checks out the base branch (`main`), and the community branch plugin then records the run as `branch=main` — the quality gate fails on existing main issues and never sees the PR fixes.
