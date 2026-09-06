import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WeekStripDay, WeekStripPage } from '../types/calendarWeekStrip.types';
import { CalendarWeekStrip } from './calendarWeekStrip.view';

function aDay(overrides: Partial<WeekStripDay> = {}): WeekStripDay {
  return {
    key: '2026-09-07',
    dayOfMonth: 7,
    isOutsideMonth: false,
    isClosed: false,
    isToday: false,
    isSelected: false,
    dots: [],
    description: '7 de Setembro, sem reservas',
    ...overrides,
  };
}

function aWeek(
  key: string,
  startDay: number,
  overrides: Partial<WeekStripDay>[] = [],
): WeekStripPage {
  return {
    key,
    days: Array.from({ length: 7 }, (_unused, index) =>
      aDay({
        key: `${key}-${index}`,
        dayOfMonth: startDay + index,
        ...overrides[index],
      }),
    ),
  };
}

const onSelectDay = vi.fn();

function renderStrip(weeks: WeekStripPage[], selectedKey: string | null = null) {
  return render(
    <CalendarWeekStrip weeks={weeks} selectedKey={selectedKey} onSelectDay={onSelectDay} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CalendarWeekStrip', () => {
  it('heads the strip with seven Monday-first columns', () => {
    renderStrip([aWeek('w1', 1)]);

    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('DOM')).toBeInTheDocument();
  });

  it('renders one page per week and seven cells per page', () => {
    renderStrip([aWeek('w1', 1), aWeek('w2', 8)]);

    expect(screen.getAllByRole('button')).toHaveLength(14);
  });

  it('names each cell after its date and what the day holds', () => {
    renderStrip([{ key: 'w1', days: [aDay({ description: '7 de Setembro, 2 reservas' })] }]);

    expect(screen.getByRole('button', { name: '7 de Setembro, 2 reservas' })).toBeInTheDocument();
  });

  it('reports the day key it was given', async () => {
    renderStrip([{ key: 'w1', days: [aDay()] }]);

    await userEvent.setup().click(screen.getByRole('button'));

    expect(onSelectDay).toHaveBeenCalledWith('2026-09-07');
  });

  it('marks the selected day as the current date', () => {
    renderStrip([{ key: 'w1', days: [aDay({ isSelected: true })] }]);

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'date');
  });

  it('disables a day outside the month', () => {
    renderStrip([{ key: 'w1', days: [aDay({ isOutsideMonth: true })] }]);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('dots the day with the chip state vocabulary, cancelled excluded upstream', () => {
    const { container } = renderStrip([
      { key: 'w1', days: [aDay({ dots: ['pending', 'confirmed', 'completed'] })] },
    ]);

    const dots = container.querySelectorAll('[data-status]');

    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('data-status', 'pending');
  });
});

describe('CalendarWeekStrip — the strip follows the selection, once', () => {
  const PAGE_WIDTH = 390;

  function stripOf(container: HTMLElement) {
    const strip = container.firstElementChild?.children[1] as HTMLDivElement;

    Object.defineProperty(strip, 'clientWidth', { value: PAGE_WIDTH, configurable: true });

    return strip;
  }

  it('scrolls to the week holding the selected day', () => {
    const weeks = [aWeek('w1', 1), aWeek('w2', 8), aWeek('w3', 15)];
    const { container, rerender } = renderStrip(weeks);
    const strip = stripOf(container);

    rerender(<CalendarWeekStrip weeks={weeks} selectedKey="w3-2" onSelectDay={onSelectDay} />);

    expect(strip.scrollLeft).toBe(2 * PAGE_WIDTH);
  });

  it('does not move the strip again for the same selection', () => {
    const weeks = [aWeek('w1', 1), aWeek('w2', 8), aWeek('w3', 15)];
    const { container, rerender } = renderStrip(weeks);
    const strip = stripOf(container);

    rerender(<CalendarWeekStrip weeks={weeks} selectedKey="w3-2" onSelectDay={onSelectDay} />);
    strip.scrollLeft = 0;
    rerender(<CalendarWeekStrip weeks={weeks} selectedKey="w3-2" onSelectDay={onSelectDay} />);

    expect(strip.scrollLeft).toBe(0);
  });

  it('leaves the strip alone while nothing is selected', () => {
    const { container } = renderStrip([aWeek('w1', 1), aWeek('w2', 8)]);

    expect(stripOf(container).scrollLeft).toBe(0);
  });

  it('leaves the strip alone for a selection no page holds', () => {
    const weeks = [aWeek('w1', 1)];
    const { container, rerender } = renderStrip(weeks);
    const strip = stripOf(container);
    strip.scrollLeft = 111;

    rerender(
      <CalendarWeekStrip weeks={weeks} selectedKey="2026-10-04" onSelectDay={onSelectDay} />,
    );

    expect(strip.scrollLeft).toBe(111);
  });
});
