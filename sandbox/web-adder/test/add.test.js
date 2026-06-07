import { describe, it, expect } from 'vitest';
import { add } from '../public/add.js';

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(4, 5)).toBe(9);
  });

  it('handles negatives', () => {
    expect(add(-2, 2)).toBe(0);
  });
});
