import { CombinedGraphQLErrors } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { useServicesViewModel } from './services.viewmodel';

const registerServiceMock = vi.fn();
const loadMoreMock = vi.fn();
const modelStateMock = vi.fn();

const submitResultMock = vi.fn();

vi.mock('../model/services.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/services.model')>()),
  useServicesModel: (category: string) => ({
    ...modelStateMock(category),
    loadMore: loadMoreMock,
    registerService: registerServiceMock,
  }),
}));

function anEdge(id: string) {
  return { cursor: `cursor-${id}`, node: { id } };
}

const CONNECTION = {
  data: { services: { edges: [anEdge('s1'), anEdge('s3')] } },
  loading: false,
  error: undefined,
  isLoadingMore: false,
  canLoadMore: false,
};

function aPagedState(overrides: { canLoadMore?: boolean; isLoadingMore?: boolean } = {}) {
  return {
    ...CONNECTION,
    canLoadMore: overrides.canLoadMore ?? true,
    isLoadingMore: overrides.isLoadingMore ?? false,
  };
}

const successPayload = {
  data: { registerService: { __typename: 'RegisterServiceSuccess', service: { id: 's9' } } },
};

const conflictPayload = {
  data: {
    registerService: {
      __typename: 'ServiceAlreadyExistsError',
      message: 'Service already exists',
    },
  },
};

function Harness() {
  const {
    category,
    selectCategory,
    categories,
    serviceIds,
    sentinelRef,
    isLoading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
  } = useServicesViewModel();

  const [searchParams] = useSearchParams();

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="category">{category.value}</span>
      <span data-testid="query-string">{searchParams.toString()}</span>
      <span data-testid="service-ids">{serviceIds.join(',')}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-loading-more">{String(isLoadingMore)}</span>
      <span data-testid="load-error">{loadError ?? ''}</span>

      <div ref={sentinelRef} />
      <button type="button" onClick={resetForm}>
        limpar
      </button>
      <span data-testid="form-error">{formError ?? ''}</span>
      <span data-testid="name-error">{errors.name?.message ?? ''}</span>
      <span data-testid="price-error">{errors.price?.message ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="preço" type="number" {...register('price', { valueAsNumber: true })} />
      <input
        aria-label="duração"
        type="number"
        {...register('durationMinutes', { valueAsNumber: true })}
      />

      {categories.map((entry) => (
        <button key={entry.slug} type="button" onClick={() => selectCategory(entry)}>
          {entry.label}
        </button>
      ))}

      <button type="submit">adicionar</button>
    </form>
  );
}

function renderHarness(search = '') {
  return render(
    <MemoryRouter initialEntries={[`${PATHS.services}${search}`]}>
      <Harness />
    </MemoryRouter>,
  );
}

async function fillAndSubmit(values: { name: string; price?: string; duration?: string }) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('nome'), values.name);
  if (values.price) await user.type(screen.getByLabelText('preço'), values.price);
  if (values.duration) await user.type(screen.getByLabelText('duração'), values.duration);
  await user.click(screen.getByRole('button', { name: 'adicionar' }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  modelStateMock.mockReturnValue(CONNECTION);
  registerServiceMock.mockResolvedValue(successPayload);
});

describe('useServicesViewModel — the tab lives in the URL', () => {
  it('defaults to nails when no ?categoria= is present', () => {
    renderHarness();

    expect(screen.getByTestId('category')).toHaveTextContent('nails');
  });

  it('reads the brows slug off the query string', () => {
    renderHarness('?categoria=sobrancelhas');

    expect(screen.getByTestId('category')).toHaveTextContent('eyebrows');
  });

  it('falls back to nails on a slug a human mistyped, rather than throwing', () => {
    renderHarness('?categoria=banana');

    expect(screen.getByTestId('category')).toHaveTextContent('nails');
  });

  it('writes the slug to the query string when a tab is picked', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));

    expect(screen.getByTestId('query-string')).toHaveTextContent('categoria=sobrancelhas');
    expect(screen.getByTestId('category')).toHaveTextContent('eyebrows');
  });
});

describe('useServicesViewModel — the category is the query, not a filter', () => {
  it('asks the model for the wire value the URL names', () => {
    renderHarness('?categoria=sobrancelhas');

    expect(modelStateMock).toHaveBeenCalledWith('eyebrows');
    expect(modelStateMock).not.toHaveBeenCalledWith('sobrancelhas');
  });

  it('defaults the query to nails when the URL names nothing', () => {
    renderHarness();

    expect(modelStateMock).toHaveBeenCalledWith('nails');
  });

  it('re-queries when the tab changes, rather than re-filtering', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));

    expect(modelStateMock).toHaveBeenLastCalledWith('eyebrows');
  });

  it('maps the whole connection, in order', () => {
    renderHarness();

    expect(screen.getByTestId('service-ids')).toHaveTextContent('s1,s3');
  });

  it('derives an empty list rather than crashing when the query returned nothing', () => {
    modelStateMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    renderHarness();

    expect(screen.getByTestId('service-ids')).toBeEmptyDOMElement();
  });
});

describe('useServicesViewModel — wiring the sentinel to the Model', () => {
  it('asks the Model for the next page when the sentinel comes into view', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState());
    renderHarness();

    act(() => observers[0]?.fire());

    expect(loadMoreMock).toHaveBeenCalledTimes(1);
  });

  it('watches nothing while a page is already in flight', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState({ canLoadMore: false, isLoadingMore: true }));
    renderHarness();

    expect(observers).toHaveLength(0);
    expect(loadMoreMock).not.toHaveBeenCalled();
  });

  it('watches nothing once the last page has been read', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState({ canLoadMore: false }));
    renderHarness();

    expect(observers).toHaveLength(0);
    expect(loadMoreMock).not.toHaveBeenCalled();
  });

  it('tells a growing grid apart from a first load', () => {
    modelStateMock.mockReturnValue(aPagedState({ isLoadingMore: true }));
    renderHarness();

    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('reports a first load as loading, so a slow page is not read as an empty catalogue', () => {
    modelStateMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      isLoadingMore: false,
      canLoadMore: false,
    });
    renderHarness();

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('false');
  });
});

describe('useServicesViewModel — emptying the form', () => {
  it('puts every field back to its default', async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.type(screen.getByLabelText('nome'), 'Meio escrito');
    await user.type(screen.getByLabelText('preço'), '15');
    await user.click(screen.getByRole('button', { name: 'limpar' }));

    expect(screen.getByLabelText('nome')).toHaveValue('');
    expect(screen.getByLabelText('preço')).toHaveValue(null);
  });
});

describe('useServicesViewModel — submitting', () => {
  it('injects the active tab as the category', async () => {
    renderHarness('?categoria=sobrancelhas');

    await fillAndSubmit({ name: 'Design de sobrancelhas', price: '15', duration: '45' });

    expect(registerServiceMock).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'Design de sobrancelhas',
          price: 15,
          durationMinutes: 45,
          category: 'eyebrows',
        },
      },
    });
  });

  it('sends the price and the duration as numbers', async () => {
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '12.5', duration: '30' });

    const input = registerServiceMock.mock.calls[0]?.[0].variables.input;
    expect(input.price).toBe(12.5);
    expect(input.durationMinutes).toBe(30);
  });

  it('reports success once the service lands', async () => {
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(submitResultMock).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('form-error')).toBeEmptyDOMElement();
  });

  it('reports failure when the service was rejected, so the sheet is not closed over it', async () => {
    registerServiceMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('reports failure when the mutation threw', async () => {
    registerServiceMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('reports failure when the mutation resolved with no data at all', async () => {
    registerServiceMock.mockResolvedValue({ data: null });
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.network);
  });

  it('rejects an empty name client-side without firing the mutation', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'adicionar' }));

    expect(screen.getByTestId('name-error')).toHaveTextContent('Introduza o nome.');
    expect(registerServiceMock).not.toHaveBeenCalled();
  });

  it('rejects an empty price client-side without firing the mutation', async () => {
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', duration: '45' });

    expect(screen.getByTestId('price-error')).toHaveTextContent('Introduza o preço.');
    expect(registerServiceMock).not.toHaveBeenCalled();
  });
});

describe('useServicesViewModel — errors in pt-PT', () => {
  it('maps ServiceAlreadyExistsError to the (nome, categoria) copy', async () => {
    registerServiceMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SERVICE_ERROR_MESSAGES.alreadyExists,
    );
  });

  it('never surfaces the backend English message', async () => {
    registerServiceMock.mockResolvedValue(conflictPayload);
    const { container } = renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(container.textContent).not.toContain('Service already exists');
  });

  it('maps a thrown BAD_USER_INPUT to the check-your-details copy', async () => {
    registerServiceMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Invalid category', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.badInput);
  });

  it('maps a transport failure to the connection copy', async () => {
    registerServiceMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.network);
  });

  it('clears the previous conflict on the next submit', async () => {
    registerServiceMock
      .mockResolvedValueOnce(conflictPayload)
      .mockResolvedValueOnce(successPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Manicure simples', price: '15', duration: '45' });
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SERVICE_ERROR_MESSAGES.alreadyExists,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'adicionar' }));

    expect(screen.getByTestId('form-error')).toBeEmptyDOMElement();
  });

  it('maps a failed query to the load copy, never to an Apollo object', () => {
    modelStateMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network request failed'),
    });
    const { container } = renderHarness();

    expect(screen.getByTestId('load-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.load);
    expect(container.textContent).not.toContain('Network request failed');
  });
});
