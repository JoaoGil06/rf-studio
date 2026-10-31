import { render, screen } from '@testing-library/react';
import type { RevenueBar } from '../types/revenueBars.types';
import { RevenueBars } from './revenueBars.view';

function aBar(key: string, overrides: Partial<RevenueBar> = {}): RevenueBar {
  return {
    key,
    label: key,
    value: '100 €',
    spokenLabel: `Mês ${key}: 100,00 €`,
    heightPercent: 50,
    isSelected: false,
    ...overrides,
  };
}

describe('RevenueBars', () => {
  it('renders one list item per month, in the order given', () => {
    render(<RevenueBars bars={[aBar('SET'), aBar('OUT')]} />);

    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('SET');
    expect(items[1]).toHaveTextContent('OUT');
  });

  it('gives each bar the exact amount as its accessible name', () => {
    render(<RevenueBars bars={[aBar('OUT', { spokenLabel: 'Outubro 2026: 1234,50 €' })]} />);

    expect(screen.getByRole('listitem', { name: 'Outubro 2026: 1234,50 €' })).toBeInTheDocument();
  });

  it('shows the short value on screen', () => {
    render(<RevenueBars bars={[aBar('OUT', { value: '1235 €' })]} />);

    expect(screen.getByText('1235 €')).toBeInTheDocument();
  });

  it('sets the fill height from the data', () => {
    render(<RevenueBars bars={[aBar('OUT', { heightPercent: 42 })]} />);

    expect(screen.getByTestId('bar-fill')).toHaveStyle({ height: '42%' });
  });

  it('marks only the selected month', () => {
    render(<RevenueBars bars={[aBar('SET'), aBar('OUT', { isSelected: true })]} />);

    const [september, october] = screen.getAllByRole('listitem');

    expect(september).not.toHaveAttribute('aria-current');
    expect(october).toHaveAttribute('aria-current', 'true');
  });

  it('draws no fill for a month that earned nothing, but keeps its column', () => {
    render(<RevenueBars bars={[aBar('OUT', { heightPercent: 0, value: '0 €' })]} />);

    expect(screen.queryByTestId('bar-fill')).not.toBeInTheDocument();
    expect(screen.getByText('0 €')).toBeInTheDocument();
  });
});
