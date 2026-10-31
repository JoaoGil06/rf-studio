import { render, screen } from '@testing-library/react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { TopPolishes } from './topPolishes.view';

const POLISHES = [
  { id: 'p1', label: 'Andreia · Rouge', colour: '#112233', count: '×4', barPercent: 100 },
  { id: 'p2', label: 'Kelly K · Nude', colour: '#445566', count: '×1', barPercent: 25 },
];

describe('TopPolishes', () => {
  it('renders each polish with its label and count, in the order given', () => {
    render(<TopPolishes polishes={POLISHES} />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent('Andreia · Rouge');
    expect(items[0]).toHaveTextContent('×4');
    expect(items[1]).toHaveTextContent('Kelly K · Nude');
  });

  it('paints the swatch and the bar in the polish’s own colour', () => {
    render(<TopPolishes polishes={POLISHES} />);

    expect(screen.getAllByTestId('swatch')[0]).toHaveStyle({ background: '#112233' });
    expect(screen.getAllByTestId('polish-bar')[0]).toHaveStyle({ background: '#112233' });
  });

  it('sizes each bar from the data', () => {
    render(<TopPolishes polishes={POLISHES} />);

    expect(screen.getAllByTestId('polish-bar')[1]).toHaveStyle({ width: '25%' });
  });

  it('says so when no polish was recorded this month', () => {
    render(<TopPolishes polishes={[]} />);

    expect(screen.getByText(DASHBOARD_COPY.topPolishesEmpty)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
