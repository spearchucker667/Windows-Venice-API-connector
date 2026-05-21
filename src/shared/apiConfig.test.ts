import { describe, it, expect } from 'vitest';
import { parsePositiveIntEnv } from './apiConfig';

describe('parsePositiveIntEnv', () => {
  it('falls back on invalid values', () => {
    expect(parsePositiveIntEnv(undefined, 10, 1, 100)).toBe(10);
    expect(parsePositiveIntEnv('abc', 10, 1, 100)).toBe(10);
    expect(parsePositiveIntEnv('-1', 10, 1, 100)).toBe(10);
    expect(parsePositiveIntEnv('0', 10, 1, 100)).toBe(10);
  });
  it('clamps huge and accepts valid', () => {
    expect(parsePositiveIntEnv('9999', 10, 1, 100)).toBe(100);
    expect(parsePositiveIntEnv('42', 10, 1, 100)).toBe(42);
  });
});
