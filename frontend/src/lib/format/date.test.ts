import { WEEKDAY_HEADS, formatDayLabel, formatMonthLabel, formatSpokenDate } from './date';

const SEPTEMBER_12 = new Date(2026, 8, 12);

describe('formatMonthLabel', () => {
  it('reads as the prototype headline: capital month, no “de”', () => {
    expect(formatMonthLabel(SEPTEMBER_12)).toBe('Setembro 2026');
  });

  it('capitalises a month whose name starts with an accent-free vowel too', () => {
    expect(formatMonthLabel(new Date(2026, 7, 1))).toBe('Agosto 2026');
  });
});

describe('formatDayLabel', () => {
  it('capitalises the month and leaves the weekday alone', () => {
    expect(formatDayLabel(SEPTEMBER_12)).toBe('sábado, 12 de Setembro');
  });

  it('does not carry the year, which the h1 above it already says', () => {
    expect(formatDayLabel(SEPTEMBER_12)).not.toContain('2026');
  });
});

describe('formatSpokenDate', () => {
  it('names the whole date, for a control whose visible label is a number', () => {
    expect(formatSpokenDate(SEPTEMBER_12)).toBe('sábado, 12 de Setembro de 2026');
  });
});

describe('WEEKDAY_HEADS', () => {
  it('runs Monday first, in tracked capitals with no trailing period', () => {
    expect(WEEKDAY_HEADS).toEqual(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']);
  });
});
