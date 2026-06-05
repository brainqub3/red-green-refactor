# GitHub Actions Guide — Running TDD Tests in CI

Reference for the `tdd-ci` skill. Covers workflow anatomy, triggers, caching, Playwright-in-CI, artifact upload, and branch protection. Adapt the templates in `assets/workflows/` to the real project; don't ship placeholders.

> Action major versions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, …) and runner images move over time. Verify the current versions with `find-docs`/`ctx7` or the GitHub Actions docs before committing.

## 1. Anatomy

A workflow is a YAML file in `.github/workflows/`. Key parts:

```yaml
name: CI                      # shows in the Actions tab and as the check name
on:                           # triggers
  push:
  pull_request:
    branches: [main]          # the gate: every PR into main runs this
jobs:
  unit:                       # one job = one status check
    runs-on: ubuntu-latest    # runner image
    steps:
      - uses: actions/checkout@v4
      - ...                   # setup, install, test
```

Each **job** reports its own status check on the PR. Keep **unit** and **e2e** as separate jobs so reviewers see two distinct green/red signals.

## 2. Triggers

- `push:` — run on every push to any branch for fast feedback while developing a slice.
- `pull_request: branches: [main]` — the enforcement gate; this is what branch protection makes *required*.
- Optionally scope with `paths:` to skip CI on docs-only changes, but don't prematurely optimise.

## 3. Caching & speed

- `actions/setup-node@v4` with `cache: 'npm'` (or `pnpm`/`yarn`) caches the package store keyed on the lockfile.
- `actions/setup-python@v5` with `cache: 'pip'`.
- Cache the Playwright browser binaries keyed on the Playwright version to avoid re-downloading (see template). Falls back to a fresh `install --with-deps` on a cache miss.

## 4. Playwright in CI

The non-obvious bits that make e2e reliable in CI:

- **Install browsers with system deps:** `npx playwright install --with-deps` (the `--with-deps` pulls the OS libraries headless Chromium needs on the Ubuntu runner).
- **Start the app under test.** Either rely on Playwright's `webServer` config (it boots the app and waits for the URL) or start it in a prior step. `webServer` is simplest and keeps local and CI consistent.
- **Headless by default** on CI — no extra config needed.
- **Upload artifacts even on failure** so the report/screenshots/videos survive a red run:

```yaml
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}        # upload on pass AND fail
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 14
```

These artifacts are what reviewers download from the Actions run, and what `safe-pr` references alongside the committed evidence.

## 5. Matrix (optional)

Run across versions/browsers when it adds value:

```yaml
    strategy:
      fail-fast: false
      matrix:
        node: [20, 22]
```

Don't add a matrix reflexively — it multiplies cost. Use it when the project genuinely supports multiple runtimes/browsers.

## 6. Secrets & safety

- Never commit secrets. Use repo or environment secrets: `${{ secrets.MY_TOKEN }}`.
- The default `GITHUB_TOKEN` is sufficient for status checks; grant least privilege via `permissions:` if the workflow needs more.
- Pin third-party actions to a major version (or SHA for high-security repos).

## 7. Branch protection (make checks required)

So a PR can't merge while CI is red, make the jobs **required status checks** on `main`. Via the UI: Settings → Branches → add a rule for `main` → "Require status checks to pass before merging" → select the `unit` and `e2e` checks.

Via the API — **confirm with the user first; this changes repo settings.** Pass the rules as a JSON body (portable across shells, and correctly typed — the nested booleans/arrays must not be sent as `-f` raw strings, which the API rejects). Write `protection.json`:

```json
{
  "required_status_checks": { "strict": true, "contexts": ["unit", "e2e"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
```

then apply, verify, and (if needed) undo:

```bash
gh api -X PUT repos/{owner}/{repo}/branches/main/protection --input protection.json
gh api repos/{owner}/{repo}/branches/main/protection --jq '.required_status_checks.contexts'   # read-back
gh api -X DELETE repos/{owner}/{repo}/branches/main/protection                                   # undo
```

`enforce_admins` is `false` here so a solo maintainer can't lock themselves out; set it to `true` only when the team wants admins held to the same gate. The example requires no approving reviews (`required_pull_request_reviews: null`) — add `{ "required_approving_review_count": 1 }` if the team wants mandatory review. Treat all of this as opt-in: it's an organisational policy decision, not something to apply unprompted.

## 8. Checklist before committing a workflow

- [ ] Triggers include `pull_request` → `main`.
- [ ] Unit job runs the **same** command the tests run locally.
- [ ] e2e job installs browsers `--with-deps`, starts the app, runs Playwright.
- [ ] Report + `test-results/` uploaded as artifacts with `if: ${{ !cancelled() }}`.
- [ ] Dependency + browser caching configured.
- [ ] No placeholders, no secrets, correct runtime versions.
- [ ] YAML validated (lint / `actionlint` / `gh workflow view`).
