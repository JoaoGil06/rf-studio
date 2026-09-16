import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SCHEDULES_COPY, SCHEDULES_EMPTY } from '../../../utils/constants/scheduleMessages';
import { SCHEDULE_STATUS_TABS } from '../../../utils/constants/scheduleStatuses';
import { SchedulesView } from './schedules.view';

const viewModelMock = vi.fn();
const selectStatusMock = vi.fn();

vi.mock('../viewmodel/schedules.viewmodel', () => ({
  useSchedulesViewModel: () => viewModelMock(),
}));

vi.mock('../../../components/ReservationRow', () => ({
  ReservationRow: ({
    id,
    onAction,
  }: {
    id: string;
    onAction: (id: string, kind: 'confirm' | 'cancel') => void;
  }) => (
    <div data-testid="reservation-row">
      {id}
      <button type="button" onClick={() => onAction(id, 'cancel')}>
        cancelar {id}
      </button>
    </div>
  ),
}));

vi.mock('../../../components/ReservationStatusModal', () => ({
  ReservationStatusModal: ({
    scheduleId,
    kind,
    onClose,
  }: {
    scheduleId: string | null;
    kind: string | null;
    onClose: () => void;
  }) =>
    scheduleId ? (
      <div data-testid="status-modal">
        {scheduleId}:{kind}
        <button type="button" onClick={onClose}>
          fechar
        </button>
      </div>
    ) : null,
}));

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    tabs: SCHEDULE_STATUS_TABS,
    activeSlug: 'pendentes',
    selectStatus: selectStatusMock,
    reservationIds: ['s1', 's4'],
    sentinelRef: vi.fn(),
    emptyState: SCHEDULES_EMPTY.pending,
    isLoading: false,
    isLoadingMore: false,
    loadError: null,
    ...overrides,
  };
}

function renderPage(overrides: Record<string, unknown> = {}) {
  viewModelMock.mockReturnValue(aViewModel(overrides));

  return render(<SchedulesView />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SchedulesView — the heading and the tabs', () => {
  it('renders the page heading, with the whisper hidden from assistive tech', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Reservas' })).toBeInTheDocument();
    expect(screen.getByText(SCHEDULES_COPY.whisper)).toHaveAttribute('aria-hidden', 'true');
  });

  it('offers the four states in lifecycle order, pressing only the active one', () => {
    renderPage({ activeSlug: 'concluidas' });

    const group = screen.getByRole('group', { name: SCHEDULES_COPY.tabsLabel });
    const tabs = Array.from(group.querySelectorAll('button'));

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'PENDENTES',
      'CONFIRMADAS',
      'CONCLUÍDAS',
      'CANCELADAS',
    ]);
    expect(screen.getByRole('button', { name: 'CONCLUÍDAS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'PENDENTES' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('hands the chosen tab to the viewmodel', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'CANCELADAS' }));

    expect(selectStatusMock).toHaveBeenCalledWith(expect.objectContaining({ slug: 'canceladas' }));
  });
});

describe('SchedulesView — the queue', () => {
  it('renders one row per id, in the order the viewmodel gave them', () => {
    renderPage();

    expect(
      screen.getAllByTestId('reservation-row').map((row) => row.firstChild?.textContent),
    ).toEqual(['s1', 's4']);
  });

  it('shows the tab’s own empty panel once the request has settled on nothing', () => {
    renderPage({ reservationIds: [], emptyState: SCHEDULES_EMPTY.cancelled });

    expect(screen.getByText(SCHEDULES_EMPTY.cancelled.title)).toBeInTheDocument();
    expect(screen.getByText(SCHEDULES_EMPTY.cancelled.body)).toBeInTheDocument();
  });

  it('does not show the empty panel while there are rows', () => {
    renderPage();

    expect(screen.queryByText(SCHEDULES_EMPTY.pending.title)).not.toBeInTheDocument();
  });

  it('does not call the queue empty while its first page is still coming', () => {
    renderPage({ reservationIds: [], isLoading: true });

    expect(screen.queryByText(SCHEDULES_EMPTY.pending.title)).not.toBeInTheDocument();
  });

  it('announces a failed load and does not also claim the queue is empty', () => {
    renderPage({ reservationIds: [], loadError: SCHEDULES_COPY.load });

    expect(screen.getByRole('alert')).toHaveTextContent(SCHEDULES_COPY.load);
    expect(screen.queryByText(SCHEDULES_EMPTY.pending.title)).not.toBeInTheDocument();
  });

  it('shows the loader only while a further page is coming', () => {
    const { unmount } = renderPage();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    unmount();
    renderPage({ isLoadingMore: true });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SchedulesView — confirming a change of state', () => {
  it('asks nothing until a row reports an action', () => {
    renderPage();

    expect(screen.queryByTestId('status-modal')).not.toBeInTheDocument();
  });

  it('opens the dialog for the row and the action that were pressed', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'cancelar s4' }));

    expect(screen.getByTestId('status-modal')).toHaveTextContent('s4:cancel');
  });

  it('closes the dialog when it says it is done', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'cancelar s1' }));
    await user.click(screen.getByRole('button', { name: 'fechar' }));

    expect(screen.queryByTestId('status-modal')).not.toBeInTheDocument();
  });
});
