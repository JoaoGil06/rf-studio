import {
  buildSlots,
  coveredSlotTimes,
  isSlotCovered,
  isSlotTaken,
  mergeSlotTimes,
  minutesOfDay,
  spansOverlap,
  toLocalDateTime,
  toMinutes,
  toSlotKey,
} from './slots';

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

describe('toLocalDateTime', () => {
  it('builds the local instant the studio means by a day and an hour', () => {
    const at = toLocalDateTime('2026-09-12', '10:30');

    expect(at?.getFullYear()).toBe(2026);
    expect(at?.getMonth()).toBe(8);
    expect(at?.getDate()).toBe(12);
    expect(toSlotKey(at as Date)).toBe('10:30');
  });

  it('round-trips through ISO without moving the hour on the screen', () => {
    const at = toLocalDateTime('2026-09-12', '17:30') as Date;

    expect(toSlotKey(new Date(at.toISOString()))).toBe('17:30');
  });

  it('rejects a malformed key or slot', () => {
    expect(toLocalDateTime('12/09/2026', '10:00')).toBeNull();
    expect(toLocalDateTime('2026-09-12', '10h')).toBeNull();
  });

  it('rejects a day that does not exist rather than rolling into the next month', () => {
    expect(toLocalDateTime('2026-02-31', '10:00')).toBeNull();
  });
});

const DAY = [
  { startMinutes: 9 * 60, endMinutes: 12 * 60 },
  { startMinutes: 14 * 60, endMinutes: 22 * 60 + 30 },
];

describe('toMinutes', () => {
  it('reads the clock back off the key', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('00:00')).toBe(0);
  });

  it('refuses a key that is not one', () => {
    expect(toMinutes('9:30')).toBeNull();
    expect(toMinutes('')).toBeNull();
  });
});

describe('spansOverlap — the chair is free the moment the last one is up', () => {
  it('does not collide two appointments that merely touch', () => {
    const first = { startMinutes: 600, endMinutes: 630 };
    const second = { startMinutes: 630, endMinutes: 660 };

    expect(spansOverlap(first, second)).toBe(false);
    expect(spansOverlap(second, first)).toBe(false);
  });

  it('collides one that starts inside the other, in either order', () => {
    const long = { startMinutes: 600, endMinutes: 690 };
    const short = { startMinutes: 660, endMinutes: 675 };

    expect(spansOverlap(long, short)).toBe(true);
    expect(spansOverlap(short, long)).toBe(true);
  });
});

describe('isSlotTaken — both directions of the same arithmetic', () => {
  const busy = [{ startMinutes: 10 * 60, endMinutes: 11 * 60 + 30 }];

  it('takes every half hour a booked appointment runs through', () => {
    expect(isSlotTaken('10:00', 30, busy)).toBe(true);
    expect(isSlotTaken('10:30', 30, busy)).toBe(true);
    expect(isSlotTaken('11:00', 30, busy)).toBe(true);
  });

  it('frees the half hour it ends on', () => {
    expect(isSlotTaken('11:30', 30, busy)).toBe(false);
  });

  it('takes an hour a long service would run forwards into a booking', () => {
    expect(isSlotTaken('09:00', 90, busy)).toBe(true);
    expect(isSlotTaken('09:00', 60, busy)).toBe(false);
  });

  it('has no opinion on studio hours — a service may run past closing', () => {
    expect(isSlotTaken('11:30', 90, [])).toBe(false);
    expect(isSlotTaken('22:00', 120, [])).toBe(false);
  });

  it('takes its own half hour rather than none of the day on a broken duration', () => {
    expect(isSlotTaken('10:00', 0, busy)).toBe(true);
  });

  it('has no opinion on a time that is not a time', () => {
    expect(isSlotTaken('nope', 30, busy)).toBe(false);
  });
});

describe('coveredSlotTimes', () => {
  it('covers the start and every half hour up to the end, exclusive', () => {
    const covered = coveredSlotTimes(buildSlots(DAY, 30), [
      { startMinutes: 10 * 60, endMinutes: 11 * 60 + 30 },
    ]);

    expect([...covered]).toEqual(['10:00', '10:30', '11:00']);
  });

  it('covers nothing at all when nothing is booked', () => {
    expect(coveredSlotTimes(buildSlots(DAY, 30), []).size).toBe(0);
  });
});

describe('isSlotCovered', () => {
  const busy = [{ startMinutes: 10 * 60, endMinutes: 11 * 60 + 30 }];

  it('covers the appointment’s own start and the hours it runs through', () => {
    expect(isSlotCovered('10:00', busy)).toBe(true);
    expect(isSlotCovered('11:00', busy)).toBe(true);
  });

  it('does not cover the hour the appointment ends on', () => {
    expect(isSlotCovered('11:30', busy)).toBe(false);
  });

  it('does not cover a free hour before it, even one too short for anything', () => {
    expect(isSlotCovered('09:30', busy)).toBe(false);
  });

  it('covers nothing for a malformed key', () => {
    expect(isSlotCovered('10h', busy)).toBe(false);
  });
});
