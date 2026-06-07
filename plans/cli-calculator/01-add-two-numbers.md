# Slice 01: Add two numbers via the CLI

- **Feature:** cli-calculator
- **Slice slug:** add-two-numbers
- **Branch:** feat/cli-calculator/01-add-two-numbers
- **Status:** ◐ in-progress
- **Walking skeleton?** yes

## Goal — the minimum testable behaviour

Running the CLI with two numeric arguments prints their sum to stdout. This is the thinnest
end-to-end thread that wires the whole project together: a CLI entrypoint → a pure `add(a, b)`
function → stdout, with both a unit test and an integration test that invokes the real CLI.

## INVEST check

- **Independent:** stands alone; no other slice is required for it to deliver value.
- **Valuable:** a developer can compute a sum from the terminal — the smallest useful behaviour.
- **Small:** one function plus a thin CLI wrapper; comfortably under an hour.
- **Testable:** verified by a unit test on `add` and an integration test running the CLI.

## Acceptance criterion (outer loop — the failing e2e/integration test)

```gherkin
Given the cli-calculator project is installed
When  a developer runs `node src/cli.js 2 3`
Then  the process prints "5" to stdout
And   exits with status code 0
```

- **Boundary / endpoint:** CLI command — `node src/cli.js <a> <b>` (run from `sandbox/cli-calculator/`).
- **e2e test type:** API/integration test (spawns the real CLI as a child process; no browser).
- **e2e test file (planned):** `sandbox/cli-calculator/test/cli.integration.test.js`

## Inner loop — initial unit test list

Seed for the inner red-green-refactor cycles. Living list — add as design emerges.

- [x] `add(2, 3)` returns `5` (basic addition).
- [x] `add(-1, 1)` returns `0` (handles negatives / triangulation toward real implementation).

## Out of scope for this slice (deferred)

- Non-numeric input handling and error messages.
- Wrong number of arguments (0, 1, or 3+ args).
- Operations other than addition.
- Floating-point precision / formatting.

## Definition of done

- [x] Acceptance/integration test written, seen to fail for the right reason, now GREEN.
- [x] All seeded unit behaviours covered; full suite passes locally.
- [x] Refactor pass complete (no duplication, clear names) with the bar green.
- [x] Slice's tests run in CI (`tdd-ci`) — `.github/workflows/cli-calculator.yml`.
- [ ] Evidence collected and PR opened into `main` (`safe-pr`).

## Status / progress log

- 2026-06-07 planned.
- 2026-06-07 outer RED: acceptance test `node src/cli.js 2 3` fails — CLI absent (MODULE_NOT_FOUND).
- 2026-06-07 inner RED→GREEN: `add(2,3)` — faked constant 5 to green.
- 2026-06-07 inner RED→GREEN: triangulated `add(-1,1)=0` — replaced fake with real `a + b`.
- 2026-06-07 outer GREEN: wrote `src/cli.js` boundary; full suite 3/3 passing locally.
