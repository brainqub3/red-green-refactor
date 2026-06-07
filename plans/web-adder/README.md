# Feature: Web Adder (harness smoke-test — web modality)

A tiny self-contained web app under `sandbox/web-adder/`: a page with two number inputs that
shows their sum. Purpose: re-test the harness end-to-end for the **web modality** — Playwright
e2e with screenshot + video evidence, and the subdirectory Playwright CI workflow.

- **Slug:** web-adder
- **Created:** 2026-06-07
- **Status:** planning
- **New system?** yes (first slice is a walking skeleton)
- **Project directory:** `sandbox/web-adder`

## Slices

| # | Slice | Goal (one line) | Status | PR |
|---|-------|-----------------|--------|----|
| 01 | [add-two-numbers](01-add-two-numbers.md) | Entering two numbers and clicking Add shows the sum on the page | ☐ todo | — |

## Out of scope (whole feature)

- Operations other than addition; input validation; styling beyond the bare minimum; persistence.

## Notes / open questions

- Smoke-test of the improved harness (web evidence path + project-directory CI).
