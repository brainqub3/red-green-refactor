#!/usr/bin/env node
/**
 * collect-evidence.mjs — gather Playwright test artifacts into a committed evidence folder
 * and render a Markdown evidence block (screenshots embedded, recordings/report/traces linked)
 * for a TDD-harness pull request.
 *
 * Cross-platform (Windows/macOS/Linux). Requires Node 18+ and a git repo.
 *
 * Usage:
 *   node collect-evidence.mjs --feature <slug> --slice <NN-slug> \
 *        [--report-dir playwright-report] [--results-dir test-results] \
 *        [--template path/to/pr-body-template.md] [--out PR_BODY.md] \
 *        [--max-screenshots 12] [--include-traces] [--force]
 *
 * Safety:
 *   - By default RAW traces (*.zip) and HAR captures (*.har) are NOT copied into the committed
 *     evidence (they routinely contain auth tokens / cookies). Opt in with --include-traces.
 *   - Copied text artifacts are scanned for likely secrets; if any match, the script prints a
 *     loud "SECRETS SUSPECTED" report so the human reviews BEFORE committing. It never echoes the
 *     matched secret value, only the file and which pattern matched.
 *   - Inline image URLs are pinned to the current commit SHA (via raw.githubusercontent.com) so
 *     they keep rendering even after the branch is deleted on merge.
 *   - --out is never silently clobbered: if the target exists, output goes to <name>.generated.md
 *     unless --force is given.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    }
  }
  return args;
}

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

/** Parse owner/repo from a github.com remote URL (https or ssh). Returns null otherwise. */
function parseRepo(remoteUrl) {
  if (!remoteUrl) return null;
  const m = remoteUrl.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?\/?$/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

/** Recursively list files under dir (absolute paths). */
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** OS path -> forward-slash repo-relative path (for URLs and display). */
function toRepoUrlPath(absPath, repoRoot) {
  return path.relative(repoRoot, absPath).split(path.sep).join('/');
}

// High-signal secret patterns. Specific enough to limit false positives on report boilerplate.
const SECRET_PATTERNS = [
  ['Authorization: Bearer', /authorization\s*:\s*bearer\s+\S+/i],
  ['Set-Cookie header', /\bset-cookie\s*:/i],
  ['Cookie header with value', /\bcookie\s*:\s*[^\s;]+=/i],
  ['Bearer token', /\bbearer\s+[A-Za-z0-9._\-]{20,}/i],
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}/],
  ['Assigned credential', /\b(api[_-]?key|secret|password|passwd|access[_-]?token)\b\s*[=:]\s*['"]?[A-Za-z0-9._\-]{8,}/i],
];

const TEXT_EXT = /\.(json|har|txt|log|xml|md|yaml|yml|csv|html?)$/i;

function scanForSecrets(files) {
  const hits = [];
  for (const f of files) {
    if (!TEXT_EXT.test(f)) continue;
    let stat;
    try { stat = fs.statSync(f); } catch { continue; }
    if (stat.size > 2 * 1024 * 1024) continue; // skip very large bundles
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const [name, re] of SECRET_PATTERNS) {
      if (re.test(content)) hits.push({ file: f, pattern: name });
    }
  }
  return hits;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const feature = args.feature;
  const slice = args.slice;
  if (!feature || !slice) {
    console.error('ERROR: --feature <slug> and --slice <NN-slug> are required.');
    process.exit(1);
  }

  const reportDir = args['report-dir'] || 'playwright-report';
  const resultsDir = args['results-dir'] || 'test-results';
  const maxShots = parseInt(args['max-screenshots'] || '12', 10);
  const includeTraces = !!args['include-traces'];
  const force = !!args.force;
  let outFile = args.out || 'PR_BODY.md';

  const repoRoot = sh('git rev-parse --show-toplevel') || process.cwd();
  const branch = sh('git rev-parse --abbrev-ref HEAD');
  const sha = sh('git rev-parse HEAD');
  const ref = sha || branch; // pin image URLs to the commit so they survive branch deletion
  const remote = sh('git remote get-url origin');
  const repo = parseRepo(remote);

  if (!branch || branch === 'HEAD') {
    console.warn('WARN: detached HEAD or no branch — checkout the feature branch before collecting evidence.');
  }
  if (!repo) {
    if (remote) console.warn('WARN: origin is not a github.com remote (GitHub Enterprise hosts are not auto-detected) — images will use repo-relative paths and may not render in the PR description.');
    else console.warn('WARN: no origin remote — images will use repo-relative paths until the branch is pushed to GitHub.');
  }

  const destRel = path.join('docs', 'tdd-evidence', feature, slice);
  const destAbs = path.join(repoRoot, destRel);
  fs.mkdirSync(destAbs, { recursive: true });

  // Copy report + results into the committed evidence folder.
  const copied = [];
  for (const [src, name] of [[reportDir, 'playwright-report'], [resultsDir, 'test-results']]) {
    const srcAbs = path.isAbsolute(src) ? src : path.join(repoRoot, src);
    if (fs.existsSync(srcAbs)) {
      fs.cpSync(srcAbs, path.join(destAbs, name), { recursive: true });
      copied.push(name);
    }
  }
  if (copied.length === 0) {
    console.warn(`WARN: neither "${reportDir}" nor "${resultsDir}" exist. Run the Playwright suite first so there are artifacts to collect.`);
  }

  // Safety: by default drop raw traces (.zip) and HAR captures (.har) from the committed copy.
  let droppedSensitive = 0;
  if (!includeTraces) {
    for (const f of walk(destAbs)) {
      if (/\.(zip|har)$/i.test(f)) { fs.rmSync(f, { force: true }); droppedSensitive++; }
    }
  }

  // Classify remaining artifacts.
  const files = walk(destAbs);
  const screenshots = files.filter(f => /\.(png|jpe?g)$/i.test(f)).sort();
  const videos = files.filter(f => /\.(webm|mp4)$/i.test(f)).sort();
  const isTrace = f => /\.zip$/i.test(f) && /(^|[\\/])trace[^\\/]*\.zip$/i.test(f);
  const traces = files.filter(isTrace).sort();
  const reportIndex = files.find(f => /playwright-report[\\/].*index\.html$/i.test(f));

  // Secret scan over the committed text artifacts.
  const secretHits = scanForSecrets(files);

  const rawUrl = (rel) => repo && ref ? `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${ref}/${rel}` : rel;
  const blobUrl = (rel) => repo && ref ? `https://github.com/${repo.owner}/${repo.repo}/blob/${ref}/${rel}` : rel;

  // Build the Markdown evidence block.
  const lines = [];
  lines.push('### Visual evidence');
  lines.push('');
  if (screenshots.length === 0) {
    lines.push("_No screenshots found. Add `await page.screenshot(...)` at the decisive assertion in the acceptance spec, or set `screenshot: 'on'` in playwright.config._");
  } else {
    for (const s of screenshots.slice(0, maxShots)) {
      const rel = toRepoUrlPath(s, repoRoot);
      const label = path.basename(s);
      lines.push(`**${label}**`, '', `![${label}](${rawUrl(rel)})`, '');
    }
    if (screenshots.length > maxShots) {
      lines.push(`_…and ${screenshots.length - maxShots} more screenshot(s) in \`${destRel.split(path.sep).join('/')}/\`._`, '');
    }
  }

  lines.push('### Recordings', '');
  if (videos.length) {
    lines.push('_Click to download and view the recording of the run:_', '');
    for (const v of videos) lines.push(`- [${path.basename(v)}](${blobUrl(toRepoUrlPath(v, repoRoot))})`);
    lines.push('');
  } else {
    lines.push('> ⚠️ **No recording was captured.** The harness requires a video of the passing acceptance run. Set `video: \'on\'` for the acceptance project, re-run the e2e suite, and re-collect.', '');
  }

  lines.push('### Reports & traces', '');
  if (reportIndex) {
    const rel = toRepoUrlPath(reportIndex, repoRoot);
    lines.push(`- Playwright HTML report: [\`${rel}\`](${blobUrl(rel)}) (also uploaded as a CI artifact — open locally with \`npx playwright show-report\`).`);
  }
  for (const t of traces) {
    const rel = toRepoUrlPath(t, repoRoot);
    lines.push(`- Trace: [${path.basename(t)}](${blobUrl(rel)}) — open with \`npx playwright show-trace <file>\`.`);
  }
  if (!includeTraces && droppedSensitive > 0) {
    lines.push(`- _(${droppedSensitive} trace/HAR file(s) omitted from evidence for safety; re-run with \`--include-traces\` after checking them for secrets.)_`);
  }
  lines.push(`- All evidence committed under \`${destRel.split(path.sep).join('/')}/\`.`, '');

  const block = lines.join('\n');

  // Emit to file (never silently clobber).
  const template = args.template;
  if (template && fs.existsSync(template)) {
    let body = fs.readFileSync(template, 'utf8');
    body = body.includes('<!-- EVIDENCE -->') ? body.replace('<!-- EVIDENCE -->', block) : body + '\n\n' + block;
    if (fs.existsSync(outFile) && !force) {
      outFile = outFile.replace(/\.md$/i, '') + '.generated.md';
      console.warn(`WARN: target PR body already exists — wrote to ${outFile} instead (use --force to overwrite).`);
    }
    fs.writeFileSync(outFile, body, 'utf8');
    console.log(`Wrote PR body with evidence to ${outFile}`);
  } else if (args.out) {
    if (fs.existsSync(outFile) && !force) {
      outFile = outFile.replace(/\.md$/i, '') + '.generated.md';
      console.warn(`WARN: target already exists — wrote evidence block to ${outFile} instead (use --force to overwrite).`);
    }
    fs.writeFileSync(outFile, block, 'utf8');
    console.log(`Wrote evidence block to ${outFile}`);
  }

  // Print the block + a summary to stdout.
  console.log('\n----- EVIDENCE BLOCK -----\n');
  console.log(block);

  // Loud secret report — the safe-pr skill keys off the "SECRETS SUSPECTED" token.
  if (secretHits.length) {
    console.log('\n==================== SECRETS SUSPECTED ====================');
    console.log('Review and redact these BEFORE committing — committed history is hard to un-publish:');
    for (const h of secretHits) console.log(`  ! ${h.pattern}  in  ${toRepoUrlPath(h.file, repoRoot)}`);
    console.log('==========================================================');
  }

  console.log('\n----- SUMMARY -----');
  console.log(`evidence folder : ${destRel.split(path.sep).join('/')}/`);
  console.log(`screenshots     : ${screenshots.length}`);
  console.log(`recordings      : ${videos.length}${videos.length ? '' : '  <-- WARNING: harness requires a recording of the acceptance run'}`);
  console.log(`traces          : ${traces.length}${includeTraces ? '' : ' (raw traces/HAR omitted; --include-traces to keep)'}`);
  console.log(`secrets         : ${secretHits.length ? secretHits.length + ' SUSPECTED — see report above' : 'none detected (still skim the evidence)'}`);
  console.log(`branch          : ${branch || '(unknown)'}`);
  console.log(`commit          : ${sha ? sha.slice(0, 12) : '(unknown)'}`);
  console.log(`repo            : ${repo ? repo.owner + '/' + repo.repo : '(no github.com remote)'}`);
  if (!repo || !branch || branch === 'HEAD') {
    console.log('note            : push the feature branch to GitHub so embedded image URLs resolve.');
  }
}

main();
