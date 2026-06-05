<!--
PR body template for the TDD harness. The collect-evidence.mjs script injects the embedded screenshots /
recordings / report links at the EVIDENCE marker in the Test evidence section below (the lone HTML comment
reading EVIDENCE). Fill every <placeholder> and delete this guidance comment.
-->

## Summary

<One or two sentences: the slice's behaviour and the value it delivers, in plain language. From the slice plan's Goal.>

- **Feature:** <feature-slug> · **Slice:** <NN> — <slice title>
- **Plan:** `plans/<feature-slug>/<NN>-<slice-slug>.md` (this branch)
- **Type:** feature / bugfix / walking-skeleton

## What changed and why

<Bullet the key changes. Tie each to the behaviour it implements. Explain non-obvious design decisions.>

- <change 1>
- <change 2>

## Acceptance criterion (the outer test)

The slice is defined "done" by this end-to-end test, which was written first, watched fail, and is now green:

```gherkin
Given <…>
When  <… through the real endpoint …>
Then  <observable outcome>
```

- **Boundary exercised:** <URL / API route / CLI command>
- **e2e spec:** `<path to spec>`

## Test evidence

### Unit tests (inner loop)

```
<paste the real unit-test run summary: framework, counts, pass/fail, duration>
```

### End-to-end tests (outer loop)

```
<paste the real Playwright run summary: specs run, passed, duration>
```

<!-- EVIDENCE -->

## How to review

1. <Start the app / where to look.>
2. <The key behaviour to exercise.>
3. Read the e2e spec `<path>` — it documents the intended behaviour end-to-end.
4. CI runs the unit + e2e jobs on this PR; the Playwright report is also uploaded as a CI artifact.

## Reviewer checklist

- [ ] The acceptance/e2e test exercises a **real external endpoint**, not internal code.
- [ ] Every production change is justified by a test.
- [ ] Unit + e2e suites are green locally and in CI.
- [ ] Code was refactored on green (no obvious duplication, clear names).
- [ ] Scope matches the slice — no gold-plating; deferred items are noted below.
- [ ] Evidence (screenshots/recording) shows the feature actually working.

## Scope & risk

- **Deliberately deferred (out of scope for this slice):** <from the plan's out-of-scope>
- **Risk / rollout notes:** <migrations, flags, backward-compat, anything to watch>

---
🤖 Built with the red-green-refactor TDD harness. One slice = one red-green-refactor pass = one PR.
