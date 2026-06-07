# Slice 01: Add two numbers on the page

- **Feature:** web-adder
- **Slice slug:** add-two-numbers
- **Branch:** feat/web-adder/01-add-two-numbers
- **Project directory:** `sandbox/web-adder`
- **Status:** ☐ todo
- **Walking skeleton?** yes

## Goal — the minimum testable behaviour

A user enters two numbers, clicks **Add**, and the page shows their sum.

## INVEST check

- **Independent:** stands alone. **Valuable:** compute a sum in the browser. **Small:** one page + one pure function + a server. **Testable:** unit on `add` + Playwright e2e through the page.

## Acceptance criterion (outer loop)

```gherkin
Given the web-adder page is open
When  the user types 4 and 5 into the two inputs and clicks "Add"
Then  the page shows the result "9"
```

- **Boundary / endpoint:** web page at `/` (served by the app).
- **e2e test type:** Playwright (browser, screenshot + video evidence).
- **e2e test file (planned):** `sandbox/web-adder/e2e/adder.spec.js`

## Inner loop — initial unit test list

- [ ] `add(4, 5)` returns `9`.
- [ ] `add(-2, 2)` returns `0` (triangulate to real implementation).

## Out of scope for this slice (deferred)

- Other operations, validation/error states, styling, keyboard submit.

## Definition of done

- [ ] Acceptance/e2e test written, seen to fail for the right reason, now GREEN.
- [ ] All seeded unit behaviours covered; full suite passes locally.
- [ ] Refactor pass complete with the bar green.
- [ ] Slice's tests run in CI (`tdd-ci`).
- [ ] Evidence (screenshot + recording) collected and PR opened into `main` (`safe-pr`).

## Status / progress log

- 2026-06-07 planned.
- 2026-06-07 outer RED (Playwright: webServer failed, app absent) → inner fake add=9 → triangulated add(-2,2)=0 → real a+b → built page + static server → outer GREEN (1 passed, screenshot+video captured) → unit 2/2 green.
