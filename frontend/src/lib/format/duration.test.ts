import { formatDuration } from './duration';

describe('formatDuration', () => {
  it('renders under an hour in minutes', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('drops the minutes on a whole hour', () => {
    expect(formatDuration(60)).toBe('1 h');
  });

  it('renders hours and minutes together', () => {
    expect(formatDuration(90)).toBe('1 h 30');
  });

  it('keeps counting past two hours', () => {
    expect(formatDuration(150)).toBe('2 h 30');
  });

  // Lowercase is the contract: the card's tracked meta line uppercases it, and
  // `lib/` does not do presentation.
  it('returns lowercase units, leaving the casing to the caller', () => {
    expect(formatDuration(45)).toBe(formatDuration(45)?.toLowerCase());
  });

  it('returns null for a duration that is not a duration', () => {
    expect(formatDuration(0)).toBeNull();
    expect(formatDuration(-30)).toBeNull();
    expect(formatDuration(Number.NaN)).toBeNull();
  });
});
