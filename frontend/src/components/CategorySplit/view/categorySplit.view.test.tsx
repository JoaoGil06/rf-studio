import { render, screen } from '@testing-library/react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { CategorySplit } from './categorySplit.view';

const MIXED = {
  nailsPercent: 62,
  browsPercent: 38,
  nailsLabel: 'Unhas 62%',
  browsLabel: 'Sobrancelhas 38%',
};

describe('CategorySplit', () => {
  it('names both categories with their shares, so colour never carries it alone', () => {
    render(<CategorySplit split={MIXED} />);

    expect(screen.getByText('Unhas 62%')).toBeInTheDocument();
    expect(screen.getByText('Sobrancelhas 38%')).toBeInTheDocument();
  });

  it('sizes each side from the data', () => {
    render(<CategorySplit split={MIXED} />);

    expect(screen.getByTestId('split-nails')).toHaveStyle({ width: '62%' });
    expect(screen.getByTestId('split-brows')).toHaveStyle({ width: '38%' });
  });

  it('draws no sliver for a side with no share', () => {
    render(
      <CategorySplit
        split={{
          nailsPercent: 100,
          browsPercent: 0,
          nailsLabel: 'Unhas 100%',
          browsLabel: 'Sobrancelhas 0%',
        }}
      />,
    );

    expect(screen.getByTestId('split-nails')).toBeInTheDocument();
    expect(screen.queryByTestId('split-brows')).not.toBeInTheDocument();
  });

  it('says so when the month earned nothing, and draws no track', () => {
    render(<CategorySplit split={null} />);

    expect(screen.getByText(DASHBOARD_COPY.splitEmpty)).toBeInTheDocument();
    expect(screen.queryByTestId('split-nails')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
