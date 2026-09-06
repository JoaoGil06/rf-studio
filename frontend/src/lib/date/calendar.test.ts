import {
  addMonths,
  buildMonthGrid,
  monthRefOf,
  parseDateKey,
  parseMonthKey,
  toDateKey,
  toMonthKey,
  toWeeks,
} from './calendar';

describe('buildMonthGrid — the Monday-first month', () => {
  it('starts on the Monday on or before the 1st', () => {
    const grid = buildMonthGrid({ year: 2026, month: 2 });

    expect(grid[0]?.key).toBe('2026-01-26');
    expect(grid[0]?.weekday).toBe(1);
    expect(grid[0]?.isOutsideMonth).toBe(true);
  });

  it('ends on the Sunday on or after the last day', () => {
    const grid = buildMonthGrid({ year: 2026, month: 2 });
    const lastDay = grid.at(-1);

    expect(lastDay?.key).toBe('2026-03-01');
    expect(lastDay?.weekday).toBe(0);
  });

  it('always fills whole weeks', () => {
    for (let month = 1; month <= 12; month += 1) {
      expect(buildMonthGrid({ year: 2026, month }).length % 7).toBe(0);
    }
  });

  it('carries no leading outside-days when the month starts on a Monday', () => {
    const grid = buildMonthGrid({ year: 2026, month: 6 });

    expect(grid[0]?.key).toBe('2026-06-01');
    expect(grid[0]?.isOutsideMonth).toBe(false);
  });

  it('marks the neighbouring months and only them', () => {
    const grid = buildMonthGrid({ year: 2026, month: 9 });
    const inside = grid.filter((day) => !day.isOutsideMonth);

    expect(inside).toHaveLength(30);
    expect(inside[0]?.key).toBe('2026-09-01');
    expect(inside.at(-1)?.key).toBe('2026-09-30');
  });

  it('reports the day of the month rather than the index', () => {
    const grid = buildMonthGrid({ year: 2026, month: 9 });

    expect(grid[0]?.dayOfMonth).toBe(31);
    expect(grid[1]?.dayOfMonth).toBe(1);
  });
});

describe('toWeeks', () => {
  it('splits the grid into rows of seven', () => {
    const weeks = toWeeks(buildMonthGrid({ year: 2026, month: 9 }));

    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toHaveLength(7);
  });

  it('refuses a grid that is not whole weeks, because a strip page would be short', () => {
    expect(() => toWeeks(buildMonthGrid({ year: 2026, month: 9 }).slice(1))).toThrow();
  });
});

describe('addMonths — stepping past a year boundary', () => {
  it('wraps December forward into the next January', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('wraps January back into the previous December', () => {
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('steps within a year without touching it', () => {
    expect(addMonths({ year: 2026, month: 9 }, 1)).toEqual({ year: 2026, month: 10 });
  });
});

describe('toDateKey — local time, deliberately', () => {
  it('reports the local day for a time near midnight', () => {
    const nearMidnight = new Date(2026, 8, 1, 0, 30);

    expect(toDateKey(nearMidnight)).toBe('2026-09-01');
  });

  it('zero-pads the month and the day', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pairs with toMonthKey and monthRefOf', () => {
    expect(toMonthKey({ year: 2026, month: 9 })).toBe('2026-09');
    expect(monthRefOf(new Date(2026, 8, 12))).toEqual({ year: 2026, month: 9 });
  });
});

describe('parseMonthKey', () => {
  it('reads a well-formed key', () => {
    expect(parseMonthKey('2026-09')).toEqual({ year: 2026, month: 9 });
  });

  it.each([null, '2026-13', '2026-00', 'setembro', '2026-9', '2026-09-12'])(
    'refuses %s',
    (value) => {
      expect(parseMonthKey(value)).toBeNull();
    },
  );
});

describe('parseDateKey', () => {
  it('reads a well-formed key as a local midnight', () => {
    const date = parseDateKey('2026-09-12');

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(12);
    expect(date?.getHours()).toBe(0);
  });

  it.each([null, '2026-02-31', '2026-13-01', '12/09/2026', '2026-09'])('refuses %s', (value) => {
    expect(parseDateKey(value)).toBeNull();
  });
});
