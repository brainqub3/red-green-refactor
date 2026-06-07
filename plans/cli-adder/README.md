# Feature: CLI Adder (harness smoke-test — non-web modality)

A tiny self-contained Node + Vitest CLI under `sandbox/cli-adder/` that adds two numbers from
the command line. Purpose: re-test the harness end-to-end after the improvements, specifically
the **non-web transcript evidence** path and **subdirectory CI** support.

- **Slug:** cli-adder
- **Created:** 2026-06-07
- **Status:** planning
- **New system?** yes (first slice is a walking skeleton)
- **Project directory:** `sandbox/cli-adder`

## Slices

| # | Slice | Goal (one line) | Status | PR |
|---|-------|-----------------|--------|----|
| 01 | [add-two-numbers](01-add-two-numbers.md) | Running the CLI with two numbers prints their sum | ☐ todo | — |

## Out of scope (whole feature)

- Operations other than addition; more than two operands; input validation beyond slice 01.

## Notes / open questions

- Smoke-test of the improved harness (non-web evidence + project-directory convention).
