---
name: safe-pr
description: Use to open a safe, reviewable pull request from a feature branch into main once a slice is built with red-green-refactor and green. Phase 4 of the TDD harness. It assembles everything a reviewer needs — the feature and slice description, evidence of the tests that ran (unit summaries plus Playwright screenshots and recordings), a reviewer checklist, and a link to the plan — then pushes the branch and opens the PR with gh. Trigger on 'raise a PR', 'open a pull request', 'ship this slice', or 'create the PR with evidence'. Deliberately cautious — confirms before pushing, never force-pushes, only targets main.
---

# Safe PR — Evidence-Rich Pull Request (Phase 4)

Open a pull request a senior engineer can approve with confidence, because the evidence is right there. This is the final phase of a slice: build (red-green-refactor) → CI (tdd-ci) → **PR**. Treat opening a PR as an outward-facing action — be careful and confirm before pushing.

Bundled resources:
- `assets/pr-body-template.md` — the PR description structure (with an `<!-- EVIDENCE -->` marker the script fills).
- `scripts/collect-evidence.mjs` — collects Playwright artifacts into the committed evidence folder and generates the PR body with embedded screenshots. Run with Node.

> Requires the GitHub CLI (`gh`) authenticated, and a GitHub remote. Confirm both early (`gh auth status`, `git remote -v`).

## Preconditions (verify, don't assume)

1. **The slice is green.** Re-run the full suite (unit + e2e) and confirm it passes. Never open a PR on red. If anything fails, stop and return to `red-green-refactor`.
2. **CI workflow exists.** `.github/workflows/` runs the unit + e2e tests (from `tdd-ci`). If missing, run `tdd-ci` first.
3. **On the slice's feature branch.** `feat/<feature-slug>/<NN>-<slice-slug>`. If you're on `main` or another branch, create/switch to the slice branch. Never develop or PR a slice from `main`.
4. **Working tree committed.** All slice work is committed in small, green-only commits.

## Procedure

1. **Produce the evidence by actually running the tests.** Run the e2e suite with Playwright configured to capture **screenshots + video (`video: 'on'`) + HTML report** (see the `red-green-refactor` test-strategy reference). The PR must include a screenshot **and a recording** of the passing acceptance run — if none was produced, re-run with video on before continuing. Capture the unit-test summary output too (counts, pass/fail). Show *real* run output, not claims.

2. **Collect & render.** Run the evidence collector from the repo root. It is plain Node, so the **same single-line invocation works on Windows, macOS, and Linux**:

   ```
   node "${CLAUDE_SKILL_DIR}/scripts/collect-evidence.mjs" --feature <feature-slug> --slice <NN-slice-slug> --template "${CLAUDE_SKILL_DIR}/assets/pr-body-template.md" --out PR_BODY.md
   ```

   It copies `playwright-report/` and `test-results/` into `docs/tdd-evidence/<feature>/<NN-slice>/`, finds the screenshots/videos/traces, scans the artifacts for likely secrets, and writes `PR_BODY.md` with the screenshots embedded (pinned to the commit SHA so they survive branch deletion) and the report/recordings linked. By default it omits raw traces and HAR files (which often carry auth tokens); pass `--include-traces` only if you need them and have checked them.

3. **Review the evidence for secrets — BEFORE committing anything.** Read the collector's output: if it reports `SECRETS SUSPECTED`, open the named files and remove or redact any tokens, cookies, passwords, or env dumps (Playwright traces, HAR captures, and HTML reports are the usual culprits). This evidence is about to be committed and pushed to a possibly public branch and **cannot be un-published once in history**. Do not proceed until it is clean. Add `test-results/` and `playwright-report/` to `.gitignore` so stray local artifacts aren't committed by accident.

4. **Finish the PR body.** Open `PR_BODY.md` and fill the remaining sections from the slice plan: the feature/slice description, what changed and why, how to review, the unit-test summary you captured, risk/rollout notes, and the plan path. Tick the reviewer-checklist items that hold. Keep it honest — if something is partial or deferred, say so.

5. **Commit the cleaned evidence and PR body.** Two statements (Windows PowerShell does not support `&&`):

   ```
   git add docs/tdd-evidence/<feature>/<NN-slice>/
   git commit -m "docs(<feature>): test evidence [slice NN]"
   ```

   The committed screenshots are what make the embedded images render in the PR.

6. **Confirm, then push.** Show the user the PR title, the body, and the branch you will push, and **get explicit confirmation** (this is outward-facing). Then push:

   ```
   git push -u origin feat/<feature-slug>/<NN-slice-slug>
   ```

   This also triggers the CI workflow. Never force-push.

7. **Open the PR into main** (single line so it pastes cleanly in any shell):

   ```
   gh pr create --base main --head feat/<feature-slug>/<NN-slice-slug> --title "feat(<feature-slug>): <slice goal> [slice NN]" --body-file PR_BODY.md
   ```

   Never target a base other than `main` unless the user explicitly asks.

8. **Record the result.** Put the PR URL into the slice plan's status log and the feature README's slice table, and tick the Definition-of-Done. Report the URL to the user. Optionally note that CI is now running on the PR and they can require those checks before merge (see `tdd-ci`). Once the PR is merged, suggest running `safe-cleanup` to retire the now-stale local feature branch.

## Safety rules (non-negotiable)

- **Confirm before any push or `gh pr create`** — these are outward-facing and visible to the team.
- **Never force-push**, never rewrite shared history, never push directly to `main`.
- **Base is always `main`** unless the user says otherwise.
- **Open the PR only on green** with evidence attached. A PR without real test evidence defeats the purpose.
- Don't include secrets, tokens, or large binaries beyond the necessary evidence. Keep videos short; rely on `'retain-on-failure'` if artifacts get heavy.

## What the reviewer gets

A PR whose description proves the slice works: the behaviour described in plain language, the failing-then-passing acceptance test, embedded screenshots of the feature working, links to the Playwright recording and HTML report, the unit-test summary, a checklist, and a link back to the execution plan. That is "everything a developer needs to review it and know the desired feature was built."
