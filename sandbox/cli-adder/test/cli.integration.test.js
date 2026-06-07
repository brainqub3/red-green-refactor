import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Acceptance test (outer loop): exercise the system ONLY through its real external
// endpoint — the CLI invoked as a child process. No internal imports.
const cliPath = fileURLToPath(new URL('../src/cli.js', import.meta.url));

describe('cli-adder (acceptance)', () => {
  it('prints the sum of two numbers and exits 0', () => {
    const stdout = execFileSync('node', [cliPath, '4', '5'], { encoding: 'utf8' });
    expect(stdout.trim()).toBe('9');
  });
});
