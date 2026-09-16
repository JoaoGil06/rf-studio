import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { SCHEDULES_COPY, SCHEDULES_EMPTY } from '../../../utils/constants/scheduleMessages';
import { useSchedulesViewModel } from './schedules.viewmodel';

const loadMoreMock = vi.fn();
const modelStateMock = vi.fn();
const statusArgMock = vi.fn();

vi.mock('../model/schedules.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/schedules.model')>()),
  useSchedulesModel: (status: string) => {
    statusArgMock(status);
    return { ...modelStateMock(), loadMore: loadMoreMock };
  },
}));

const CONNECTION = {
  data: {
    schedules: {
      edges: [
        { cursor: 'cursor-s1', node: { id: 's1' } },
        { cursor: 'cursor-s4', node: { id: 's4' } },
      ],
    },
  },
  loading: false,
  error: undefined,
  isLoadingMore: false,
  canLoadMore: false,
};

function Harness() {
  const {
    tabs,
    activeSlug,
    selectStatus,
    reservationIds,
    sentinelRef,
    emptyState,
    isLoading,
    isLoadingMore,
    loadError,
  } = useSchedulesViewModel();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <span data-testid="active-slug">{activeSlug}</span>
      <span data-testid="search">{location.search}</span>
      <span data-testid="reservation-ids">{reservationIds.join(',')}</span>
      <span data-testid="empty-title">{emptyState.title}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-loading-more">{String(isLoadingMore)}</span>
      <span data-testid="load-error">{loadError ?? ''}</span>
      <div ref={sentinelRef} />

      {tabs.map((tab) => (
        <button key={tab.slug} type="button" onClick={() => selectStatus(tab)}>
          {tab.label}
        </button>
      ))}
      <button type="button" onClick={() => void navigate(-1)}>
        voltar
      </button>
    </div>
  );
}

function renderAt(entries: string[]) {
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Routes>
        <Route path="/schedules" element={<Harness />} />
        <Route path="/agenda" element={<span data-testid="agenda">agenda</span>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  modelStateMock.mockReturnValue(CONNECTION);
});

describe('useSchedulesViewModel — the tab lives in the URL', () => {
  it('opens on Pendentes when the URL names no state', () => {
    renderAt(['/schedules']);

    expect(statusArgMock).toHaveBeenLastCalledWith('pending');
    expect(screen.getByTestId('active-slug')).toHaveTextContent('pendentes');
  });

  it('reads the state the URL names', () => {
    renderAt(['/schedules?estado=concluidas']);

    expect(statusArgMock).toHaveBeenLastCalledWith('completed');
    expect(screen.getByTestId('active-slug')).toHaveTextContent('concluidas');
  });

  it('falls back to Pendentes for a state it does not know', () => {
    renderAt(['/schedules?estado=qualquer-coisa']);

    expect(statusArgMock).toHaveBeenLastCalledWith('pending');
  });

  it('offers the four states as tabs, in lifecycle order', () => {
    renderAt(['/schedules']);

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'PENDENTES',
      'CONFIRMADAS',
      'CONCLUÍDAS',
      'CANCELADAS',
      'voltar',
    ]);
  });

  it('writes the chosen tab into the URL and asks the model for that state', async () => {
    renderAt(['/schedules']);

    await userEvent.setup().click(screen.getByRole('button', { name: 'CANCELADAS' }));

    expect(screen.getByTestId('search')).toHaveTextContent('?estado=canceladas');
    expect(statusArgMock).toHaveBeenLastCalledWith('cancelled');
  });

  it('replaces the history entry, so back leaves the page rather than walking the tabs', async () => {
    renderAt(['/agenda', '/schedules']);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'CONFIRMADAS' }));
    await user.click(screen.getByRole('button', { name: 'voltar' }));

    expect(screen.getByTestId('agenda')).toBeInTheDocument();
  });

  it('gives each tab its own empty state', () => {
    renderAt(['/schedules?estado=canceladas']);

    expect(screen.getByTestId('empty-title')).toHaveTextContent(SCHEDULES_EMPTY.cancelled.title);
  });
});

describe('useSchedulesViewModel — reading the queue', () => {
  it('maps the whole connection, in order', () => {
    renderAt(['/schedules']);

    expect(screen.getByTestId('reservation-ids')).toHaveTextContent('s1,s4');
  });

  it('derives an empty list rather than crashing when the query returned nothing', () => {
    modelStateMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    renderAt(['/schedules']);

    expect(screen.getByTestId('reservation-ids')).toBeEmptyDOMElement();
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('maps a failed load to pt-PT copy rather than surfacing the Apollo error', () => {
    modelStateMock.mockReturnValue({ ...CONNECTION, error: new Error('Failed to fetch') });
    renderAt(['/schedules']);

    expect(screen.getByTestId('load-error')).toHaveTextContent(SCHEDULES_COPY.load);
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
  });

  it('reports no load error while the request is healthy', () => {
    renderAt(['/schedules']);

    expect(screen.getByTestId('load-error')).toBeEmptyDOMElement();
  });
});

describe('useSchedulesViewModel — wiring the sentinel to the Model', () => {
  it('asks the Model for the next page when the sentinel comes into view', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue({ ...CONNECTION, canLoadMore: true });
    renderAt(['/schedules']);

    act(() => observers[0]?.fire());

    expect(loadMoreMock).toHaveBeenCalledTimes(1);
  });

  it('watches nothing once the last page has been read', () => {
    const observers = stubIntersectionObserver();
    renderAt(['/schedules']);

    expect(observers).toHaveLength(0);
    expect(loadMoreMock).not.toHaveBeenCalled();
  });

  it('tells a growing list apart from a first load', () => {
    modelStateMock.mockReturnValue({ ...CONNECTION, isLoadingMore: true });
    renderAt(['/schedules']);

    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });
});
