import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { DashboardView } from './dashboard.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/dashboard.viewmodel', () => ({
  useDashboardViewModel: () => viewModelMock(),
}));

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    monthLabel: 'Outubro 2026',
    goToPreviousMonth: vi.fn(),
    goToNextMonth: vi.fn(),
    kpis: [
      { key: 'revenue', value: '45,00 €', label: 'RECEITA · OUTUBRO' },
      { key: 'completed', value: '1', label: 'SERVIÇOS CONCLUÍDOS' },
      { key: 'pending', value: '2', label: 'RESERVAS PENDENTES' },
      { key: 'average', value: '45,00 €', label: 'MÉDIA POR SERVIÇO' },
    ],
    bars: [
      {
        key: '2026-10',
        label: 'OUT',
        value: '45 €',
        spokenLabel: 'Outubro 2026: 45,00 €',
        heightPercent: 100,
        isSelected: true,
      },
    ],
    split: {
      nailsPercent: 100,
      browsPercent: 0,
      nailsLabel: 'Unhas 100%',
      browsLabel: 'Sobrancelhas 0%',
    },
    topClients: [{ id: 'a', rank: 1, name: 'Ana', total: '45,00 €', barPercent: 100 }],
    topPolishes: [
      { id: 'p', label: 'Andreia · Rouge', colour: '#112233', count: '×1', barPercent: 100 },
    ],
    isLoading: false,
    loadError: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
});

describe('DashboardView — the header', () => {
  it('names the page and the month', () => {
    render(<DashboardView />);

    expect(screen.getByRole('heading', { level: 1, name: 'Negócio' })).toBeInTheDocument();
    expect(screen.getByText('Outubro 2026')).toBeInTheDocument();
    expect(screen.getByText(DASHBOARD_COPY.monthPicker)).toBeInTheDocument();
  });

  it('moves between months', async () => {
    const goToPreviousMonth = vi.fn();
    const goToNextMonth = vi.fn();
    viewModelMock.mockReturnValue(aViewModel({ goToPreviousMonth, goToNextMonth }));
    const user = userEvent.setup();

    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: DASHBOARD_COPY.previousMonth }));
    await user.click(screen.getByRole('button', { name: DASHBOARD_COPY.nextMonth }));

    expect(goToPreviousMonth).toHaveBeenCalledTimes(1);
    expect(goToNextMonth).toHaveBeenCalledTimes(1);
  });
});

describe('DashboardView — the figures', () => {
  it('pairs each of the four KPI labels with its value', () => {
    render(<DashboardView />);

    expect(screen.getAllByRole('term')).toHaveLength(4);
    expect(screen.getAllByRole('definition')).toHaveLength(4);
    expect(screen.getByText('RECEITA · OUTUBRO')).toBeInTheDocument();
  });

  it('hands every panel its data', () => {
    render(<DashboardView />);

    expect(screen.getByRole('listitem', { name: 'Outubro 2026: 45,00 €' })).toBeInTheDocument();
    expect(screen.getByText('Unhas 100%')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Andreia · Rouge')).toBeInTheDocument();
  });

  it('titles every panel, saying revenue rather than the prototype’s profit', () => {
    render(<DashboardView />);

    expect(screen.getByRole('heading', { level: 2, name: /Receita mensal/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: DASHBOARD_COPY.topClientsTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: DASHBOARD_COPY.topPolishesTitle }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Lucro/)).not.toBeInTheDocument();
  });
});

describe('DashboardView — the request state', () => {
  it('hides the panels while loading, but keeps the month picker usable', () => {
    viewModelMock.mockReturnValue(aViewModel({ isLoading: true }));

    render(<DashboardView />);

    expect(screen.queryByText('RECEITA · OUTUBRO')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: DASHBOARD_COPY.nextMonth })).toBeInTheDocument();
  });

  it('shows the error and no figures when the load failed', () => {
    viewModelMock.mockReturnValue(aViewModel({ loadError: DASHBOARD_COPY.load }));

    render(<DashboardView />);

    expect(screen.getByRole('alert')).toHaveTextContent(DASHBOARD_COPY.load);
    expect(screen.queryByText('RECEITA · OUTUBRO')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: DASHBOARD_COPY.previousMonth })).toBeInTheDocument();
  });

  it('survives an empty month', () => {
    viewModelMock.mockReturnValue(aViewModel({ split: null, topClients: [], topPolishes: [] }));

    render(<DashboardView />);

    expect(screen.getByText(DASHBOARD_COPY.splitEmpty)).toBeInTheDocument();
    expect(screen.getByText(DASHBOARD_COPY.topClientsEmpty)).toBeInTheDocument();
    expect(screen.getByText(DASHBOARD_COPY.topPolishesEmpty)).toBeInTheDocument();
  });
});
