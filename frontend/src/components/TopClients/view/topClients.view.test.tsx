import { render, screen, within } from '@testing-library/react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { TopClients } from './topClients.view';

const CLIENTS = [
  { id: 'b', rank: 1, name: 'Bia', total: '40,00 €', barPercent: 100 },
  { id: 'a', rank: 2, name: 'Ana', total: '10,00 €', barPercent: 25 },
];

describe('TopClients', () => {
  it('renders the clients in the order given, with rank, name and total', () => {
    render(<TopClients clients={CLIENTS} />);

    const [first, second] = screen.getAllByRole('listitem');

    expect(within(first as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(within(first as HTMLElement).getByText('Bia')).toBeInTheDocument();
    expect(within(first as HTMLElement).getByText('40,00 €')).toBeInTheDocument();
    expect(within(second as HTMLElement).getByText('Ana')).toBeInTheDocument();
  });

  it('sizes each bar from the data', () => {
    render(<TopClients clients={CLIENTS} />);

    expect(screen.getAllByTestId('client-bar')[1]).toHaveStyle({ width: '25%' });
  });

  it('says so when the month has no completed services', () => {
    render(<TopClients clients={[]} />);

    expect(screen.getByText(DASHBOARD_COPY.topClientsEmpty)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
