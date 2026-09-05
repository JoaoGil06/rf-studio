import { formatPhoneNumber } from './phone';

describe('formatPhoneNumber', () => {
  it('groups a bare nine-digit number in threes', () => {
    expect(formatPhoneNumber('912345678')).toBe('912 345 678');
  });

  it('trims before grouping, so a pasted number still reads as one', () => {
    expect(formatPhoneNumber('  912345678  ')).toBe('912 345 678');
  });

  // Total by design: the backend validates only `min(9)`, so anything can arrive.
  it('leaves an international number exactly as it was typed', () => {
    expect(formatPhoneNumber('+351912345678')).toBe('+351912345678');
  });

  it('is idempotent on a number it has already grouped', () => {
    expect(formatPhoneNumber('912 345 678')).toBe('912 345 678');
  });

  it('leaves a too-short number visibly short rather than prettifying it', () => {
    expect(formatPhoneNumber('91234')).toBe('91234');
  });

  it('leaves a too-long number alone', () => {
    expect(formatPhoneNumber('9123456789')).toBe('9123456789');
  });

  it('returns an empty string for an empty one', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});
