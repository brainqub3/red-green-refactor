# Feature: CLI Calculator (harness smoke-test)

A tiny self-contained Node + Vitest project under `sandbox/cli-calculator/` that adds two
numbers from the command line. Its real purpose is to exercise this TDD harness end-to-end
(plan → red-green-refactor → CI → safe PR) and prove that the discipline is followed and a
PR is actually raised. The "user" is a developer running the CLI in a terminal.

- **Slug:** cli-calculator
- **Created:** 2026-06-07
- **Status:** planning
- **New system?** yes (first slice is a walking skeleton)

## Slices

Develop top to bottom. One slice = one red-green-refactor pass = one PR.

| # | Slice | Goal (one line) | Status | PR |
|---|-------|-----------------|--------|----|
| 01 | [add-two-numbers](01-add-two-numbers.md) | Running the CLI with two numbers prints their sum | ☐ todo | — |

<!-- Status values: ☐ todo · ◐ in-progress · ✅ done. Update the row when a slice's PR opens. -->

## Out of scope (whole feature)

- Any operation other than addition (subtract/multiply/divide are future slices, not built here).
- More than two operands, floating-point formatting rules, or locale-aware number parsing.
- Input validation beyond what slice 01's tests demand (deferred to a later slice).
- Publishing/packaging the CLI to npm.

## Notes / open questions

- This is a deliberate smoke-test of the harness; kept to a single walking-skeleton slice.
- The project is self-contained in `sandbox/cli-calculator/` so it does not pollute the repo
  root with Node tooling. CI and the PR still follow the harness conventions.
