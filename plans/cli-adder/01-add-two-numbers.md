# Slice 01: Add two numbers via the CLI

- **Feature:** cli-adder
- **Slice slug:** add-two-numbers
- **Branch:** feat/cli-adder/01-add-two-numbers
- **Project directory:** `sandbox/cli-adder`
- **Status:** ☐ todo
- **Walking skeleton?** yes

## Goal — the minimum testable behaviour

Running the CLI with two numeric arguments prints their sum to stdout (exit 0).

## INVEST check

- **Independent:** stands alone. **Valuable:** sum from the terminal. **Small:** one function + thin CLI. **Testable:** unit on `add` + integration spawning the CLI.

## Acceptance criterion (outer loop)

```gherkin
Given the cli-adder project is installed
When  a developer runs `node src/cli.js 4 5`
Then  the process prints "9" to stdout
And   exits with status code 0
```

- **Boundary / endpoint:** CLI — `node src/cli.js <a> <b>` (run from `sandbox/cli-adder/`).
- **e2e test type:** integration test (spawns the real CLI; no browser).
- **Acceptance test file (planned):** `sandbox/cli-adder/test/cli.integration.test.js`

## Inner loop — initial unit test list

- [ ] `add(4, 5)` returns `9` (basic addition).
- [ ] `add(-2, 2)` returns `0` (triangulate toward real implementation).

## Out of scope for this slice (deferred)

- Non-numeric input, wrong arg counts, other operations, float formatting.

## Definition of done

- [ ] Acceptance/integration test written, seen to fail for the right reason, now GREEN.
- [ ] All seeded unit behaviours covered; full suite passes locally.
- [ ] Refactor pass complete with the bar green.
- [ ] Slice's tests run in CI (`tdd-ci`).
- [ ] Evidence collected and PR opened into `main` (`safe-pr`).

## Status / progress log

- 2026-06-07 planned.
- 2026-06-07 outer RED (CLI absent) → inner fake `add`=9 → triangulated `add(-2,2)=0` → real `a+b` → CLI wired → full suite 3/3 green.
