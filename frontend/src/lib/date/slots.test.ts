import { buildSlots, mergeSlotTimes, minutesOfDay, toSlotKey } from './slots';

const STUDIO = [
  { startMinutes: 9 * 60, endMinutes: 12 * 60 },
  { startMinutes: 14 * 60, endMinutes: 18 * 60 },
];

describe('buildSlots', () => {
  it('lays the studio day out in half hours, both halves', () => {
    const slots = buildSlots(STUDIO, 30);

    expect(slots).toHaveLength(14);
    expect(slots[0]).toBe('09:00');
    expect(slots.at(-1)).toBe('17:30');
  });

  it('leaves the closing minute out of the day', () => {
    expect(buildSlots(STUDIO, 30)).not.toContain('12:00');
    expect(buildSlots(STUDIO, 30)).not.toContain('18:00');
  });

  it('honours a different step', () => {
    expect(buildSlots([{ startMinutes: 9 * 60, endMinutes: 12 * 60 }], 60)).toEqual([
      '09:00',
      '10:00',
      '11:00',
    ]);
  });

  it('yields nothing for no ranges', () => {
    expect(buildSlots([], 30)).toEqual([]);
  });

  it('yields nothing rather than looping forever on a step of zero', () => {
    expect(buildSlots(STUDIO, 0)).toEqual([]);
  });
});

describe('toSlotKey / minutesOfDay', () => {
  it('zero-pads the hour', () => {
    expect(toSlotKey(new Date(2026, 8, 12, 9, 30))).toBe('09:30');
  });

  it('reads the local clock, not UTC', () => {
    expect(minutesOfDay(new Date(2026, 8, 12, 13, 15))).toBe(13 * 60 + 15);
  });
});

describe('mergeSlotTimes — the ledger does not erase an off-grid hour', () => {
  it('drops 13:00 into the midday gap where it belongs', () => {
    const merged = mergeSlotTimes(buildSlots(STUDIO, 30), ['13:00']);

    expect(merged.indexOf('13:00')).toBe(merged.indexOf('11:30') + 1);
    expect(merged.indexOf('14:00')).toBe(merged.indexOf('13:00') + 1);
  });

  it('does not repeat a time the grid already carries', () => {
    const merged = mergeSlotTimes(buildSlots(STUDIO, 30), ['10:00', '10:00']);

    expect(merged.filter((time) => time === '10:00')).toHaveLength(1);
    expect(merged).toHaveLength(14);
  });

  it('keeps an hour before the studio opens rather than hiding it', () => {
    expect(mergeSlotTimes(buildSlots(STUDIO, 30), ['08:00'])[0]).toBe('08:00');
  });
});
