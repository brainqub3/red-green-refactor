# brainqub3-rg-refactor

An **enterprise-grade Red-Green-Refactor TDD harness** for Claude Code, implemented as a suite of agent skills. It takes a feature from idea to a reviewable pull request the disciplined, test-driven way: slice → plan → red-green-refactor (unit + e2e) → CI → safe PR.

> Built for Claude Code first. The skills live in `.claude/skills/` (loaded automatically by this Claude Code project) and are mirrored to `.agents/skills/` as a portable, publishable copy.

## Why

Test-Driven Development is a **design discipline**, not a testing afterthought. This harness encodes the discipline so it is followed *literally* — every production change is driven by a failing test, you watch each test fail for the right reason, you make it pass with the minimum code, and you refactor only on green. Work proceeds in thin **vertical slices** (the smallest end-to-end testable behaviour), each shipped as its own small, evidence-backed PR.

The philosophy is distilled from James Shore, Kent Beck (*TDD by Example*), Martin Fowler, and *Growing Object-Oriented Software, Guided by Tests* (double-loop / outside-in TDD). See [`.claude/skills/red-green-refactor/references/red-green-refactor-philosophy.md`](.claude/skills/red-green-refactor/references/red-green-refactor-philosophy.md).

## The pipeline

```
  /tdd-plan          /red-green-refactor        /tdd-ci            /safe-pr
 ┌──────────┐       ┌───────────────────┐     ┌──────────┐      ┌───────────┐
 │ slice +  │  →    │ outer e2e test +  │  →  │ promote  │  →   │ evidence  │
 │ plan to  │       │ inner unit cycles │     │ tests to │      │ PR into   │
 │ plans/   │       │ on one slice      │     │ Actions  │      │ main      │
 └──────────┘       └───────────────────┘     └──────────┘      └───────────┘
        ▲                                                              │
        └──────────────── next slice ─────────────────────────────────┘
```

One slice = one red-green-refactor pass = one PR. After PRs merge, the optional `safe-cleanup` skill retires the now-stale local branches.

## The skills

| Skill | Invoke | What it does |
|---|---|---|
| **tdd-harness** | `/tdd-harness` | Orchestrator / front door. Drives the whole pipeline and enforces the gate between each phase. |
| **tdd-plan** | `/tdd-plan` | Phase 1. Decomposes a request into thin vertical slices and writes a markdown execution plan per slice into `plans/`. |
| **red-green-refactor** | `/red-green-refactor` | Phase 2. Double-loop TDD against one slice plan: a failing e2e/acceptance test (outer) wrapping unit-test red→green→refactor cycles (inner). |
| **tdd-ci** | `/tdd-ci` | Phase 3. Promotes the slice's unit + e2e tests into GitHub Actions (a deliberately separate step). |
| **safe-pr** | `/safe-pr` | Phase 4. Opens a cautious, evidence-rich PR (feature branch → `main`) with Playwright screenshots/recordings, test summaries, and the feature description. |
| **safe-cleanup** | `/safe-cleanup` | Phase 5 (optional). Safely retires stale **local** feature branches after their PRs merge — report-first, confirm-before-delete, never touches the remote, recovery SHAs logged. |

Each skill is self-contained and can be invoked on its own, or you can let `/tdd-harness` run the whole sequence. Claude will also trigger them automatically from natural phrasing ("TDD this feature", "raise a PR with evidence", etc.).

## Usage

From this repo in Claude Code:

```
/tdd-harness  build a password-reset feature
```

or step through it manually:

```
/tdd-plan            describe the feature → get plans/<feature>/ with one plan per slice
/red-green-refactor  implement slice 01 test-first (unit + e2e), green
/tdd-ci              add the GitHub Actions workflow for the tests
/safe-pr             open the PR into main with embedded evidence
```

## Conventions (shared by all skills)

- **Plans:** `plans/<feature-slug>/README.md` (index/status board) + `plans/<feature-slug>/<NN>-<slice-slug>.md` (one execution plan per slice — the contract every phase reads and updates).
- **Branches:** one per slice — `feat/<feature-slug>/<NN>-<slice-slug>`, cut from an up-to-date `main`.
- **Evidence:** `docs/tdd-evidence/<feature-slug>/<NN>-<slice-slug>/` (committed on the feature branch).
- **Commits:** small, green-only, Conventional Commits (`test:`, `feat:`, `refactor:`, `ci:`).
- **Testing:** stack-agnostic. The harness detects the project's unit runner (Vitest/Jest/pytest/go test/…) at runtime and uses **Playwright** for end-to-end web tests (configured to capture screenshots + video + trace for PR evidence). Non-web slices use integration tests through the real endpoint (HTTP/CLI/queue).

## Requirements

- **Claude Code** (skills load from `.claude/skills/`).
- **Node 18+** — for the Playwright e2e layer and the evidence collector script.
- **GitHub CLI (`gh`)**, authenticated, plus a GitHub remote — for `safe-pr` (and, optionally, for `safe-cleanup` to detect squash-merged / abandoned branches; without it, `safe-cleanup` only treats git-merged branches as eligible).
- A unit-test runner appropriate to the project (auto-detected; installed as part of a walking-skeleton slice if absent).

## Layout

```
.claude/skills/
├── tdd-harness/SKILL.md
├── tdd-plan/
│   ├── SKILL.md
│   ├── references/slicing-guide.md
│   └── assets/plan-template.md
├── red-green-refactor/
│   ├── SKILL.md
│   └── references/{red-green-refactor-philosophy.md, test-strategy.md}
├── tdd-ci/
│   ├── SKILL.md
│   ├── references/github-actions-guide.md
│   └── assets/workflows/{node-ci.yml, python-ci.yml, playwright-e2e.yml}
├── safe-pr/
│   ├── SKILL.md
│   ├── assets/pr-body-template.md
│   └── scripts/collect-evidence.mjs
└── safe-cleanup/
    ├── SKILL.md
    └── scripts/classify-branches.mjs
```

The same tree is mirrored under `.agents/skills/` for portability.
