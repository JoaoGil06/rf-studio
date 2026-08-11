import { CombinedGraphQLErrors } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { PATHS } from '../../../routes/paths';
import { PRODUCT_ERROR_MESSAGES, useProductsViewModel } from './products.viewmodel';

const registerProductMock = vi.fn();
const loadMoreMock = vi.fn();
const modelStateMock = vi.fn();

/**
 * What `submit` resolved to. The viewmodel no longer closes the sheet itself — it
 * reports whether the product landed and the View acts on it — so this is the seam
 * where "did it succeed" is now observable.
 */
const submitResultMock = vi.fn();

vi.mock('../model/products.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/products.model')>()),
  useProductsModel: (category: string) => ({
    ...modelStateMock(category),
    loadMore: loadMoreMock,
    registerProduct: registerProductMock,
  }),
}));

function anEdge(id: string, name: string) {
  return { cursor: `cursor-${id}`, node: { id, name } };
}

/**
 * One category's worth of products — which is all the server ever sends now that
 * `products(category:)` does the filtering. Nothing here is meant to be discarded
 * downstream. Cursors and page size are the Model's business and never reach here:
 * paging shows up at this layer as `canLoadMore` and `loadMore`, nothing more.
 */
const CONNECTION = {
  data: {
    products: {
      edges: [anEdge('p1', 'Nude Rosé'), anEdge('p3', 'Bordeaux')],
    },
  },
  loading: false,
  error: undefined,
  isLoadingMore: false,
  canLoadMore: false,
};

/** The same connection, but with the Model reporting pages still to come. */
function aPagedState(overrides: { canLoadMore?: boolean; isLoadingMore?: boolean } = {}) {
  return {
    ...CONNECTION,
    canLoadMore: overrides.canLoadMore ?? true,
    isLoadingMore: overrides.isLoadingMore ?? false,
  };
}

const successPayload = {
  data: { registerProduct: { __typename: 'RegisterProductSuccess', product: { id: 'p9' } } },
};

const conflictPayload = {
  data: {
    registerProduct: {
      __typename: 'ProductAlreadyExistsError',
      message: 'Product already exists',
    },
  },
};

function Harness() {
  const {
    category,
    selectCategory,
    categories,
    productIds,
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
  } = useProductsViewModel();

  const [searchParams] = useSearchParams();

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="category">{category.value}</span>
      <span data-testid="query-string">{searchParams.toString()}</span>
      <span data-testid="product-ids">{productIds.join(',')}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-loading-more">{String(isLoadingMore)}</span>
      <span data-testid="load-error">{loadError ?? ''}</span>

      {/* The View hangs this on its add tile; here any element will do — what
          matters is that the ref is always attached and `enabled` decides. */}
      <div ref={sentinelRef} />
      <button type="button" onClick={resetForm}>
        limpar
      </button>
      <span data-testid="form-error">{formError ?? ''}</span>
      <span data-testid="name-error">{errors.name?.message ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="marca" {...register('brand')} />
      <input aria-label="cor" {...register('color')} />

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
    <MemoryRouter initialEntries={[`${PATHS.products}${search}`]}>
      <Harness />
    </MemoryRouter>,
  );
}

async function fillAndSubmit(values: { name: string; brand: string; color?: string }) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('nome'), values.name);
  await user.type(screen.getByLabelText('marca'), values.brand);
  if (values.color) await user.type(screen.getByLabelText('cor'), values.color);
  await user.click(screen.getByRole('button', { name: 'adicionar' }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  modelStateMock.mockReturnValue(CONNECTION);
  registerProductMock.mockResolvedValue(successPayload);
});

describe('useProductsViewModel — the tab lives in the URL', () => {
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

describe('useProductsViewModel — the category is the query, not a filter', () => {
  it('asks the model for the category the URL names', () => {
    renderHarness('?categoria=sobrancelhas');

    expect(modelStateMock).toHaveBeenCalledWith('eyebrows');
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

  // Everything the server sent belongs to the active category, so the list is the
  // connection in order — there is nothing left to discard on the client.
  it('maps the whole connection, in order', () => {
    renderHarness();

    expect(screen.getByTestId('product-ids')).toHaveTextContent('p1,p3');
  });
});

describe('useProductsViewModel — wiring the sentinel to the Model', () => {
  // What is left of paging at this layer: the sentinel is watched while the Model
  // says another page can be fetched, and reaching it asks the Model for it. Which
  // cursor, which page size and which category go on the wire is tested in
  // `products.model.test.tsx`, because that is where those live.
  it('asks the Model for the next page when the sentinel comes into view', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState());
    renderHarness();

    act(() => observers[0]?.fire());

    expect(loadMoreMock).toHaveBeenCalledTimes(1);
  });

  /**
   * Paging stops by never being asked, not by refusing: the hook builds no observer
   * while it is disabled, so an already-visible sentinel cannot keep firing.
   */
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

  // `isLoading` covers the first page; `isLoadingMore` is specifically a grid that
  // already has cards and is growing underneath them.
  it('tells a growing grid apart from a first load', () => {
    modelStateMock.mockReturnValue(aPagedState({ isLoadingMore: true }));
    renderHarness();

    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('reports a first load as loading, but not as a growing grid', () => {
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

describe('useProductsViewModel — what the View needs to judge an empty shelf', () => {
  it('reports a request in flight, so a slow first page is not read as an empty shelf', () => {
    modelStateMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      isLoadingMore: false,
      canLoadMore: false,
    });
    renderHarness();

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  /**
   * The whole point of the server-side filter: an empty first page is now an empty
   * category, full stop. Before `products(category:)` this state was ambiguous —
   * the sobrancelhas might have been further down a catalogue of vernizes — and the
   * page had to read every remaining page to find out.
   */
  it('reports an empty list once the request has settled, when the category has none', () => {
    modelStateMock.mockReturnValue({ ...CONNECTION, data: { products: { edges: [] } } });
    renderHarness('?categoria=sobrancelhas');

    expect(screen.getByTestId('product-ids')).toBeEmptyDOMElement();
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });
});

describe('useProductsViewModel — emptying the form', () => {
  // Half a product typed and abandoned must not be waiting inside the sheet the
  // next time it opens. The viewmodel owns the emptying; the View owns when.
  it('puts every field back to its default', async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.type(screen.getByLabelText('nome'), 'Meio escrito');
    await user.click(screen.getByRole('button', { name: 'limpar' }));

    expect(screen.getByLabelText('nome')).toHaveValue('');
  });
});

describe('useProductsViewModel — submitting', () => {
  it('injects the active tab as the category', async () => {
    renderHarness('?categoria=sobrancelhas');

    await fillAndSubmit({ name: 'Castanho médio', brand: 'Anastasia', color: 'castanho' });

    expect(registerProductMock).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'Castanho médio',
          brand: 'Anastasia',
          color: 'castanho',
          isAvailable: true,
          category: 'eyebrows',
        },
      },
    });
  });

  it('sends null rather than an empty string when no colour was given', async () => {
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(registerProductMock).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'Nude Rosé',
          brand: 'OPI',
          color: null,
          isAvailable: true,
          category: 'nails',
        },
      },
    });
  });

  // The signal the View closes the sheet on: reported, not acted upon here.
  it('reports success once the product lands', async () => {
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(submitResultMock).toHaveBeenCalledWith(true);
  });

  it('reports failure when the product was rejected, so the sheet is not closed over it', async () => {
    registerProductMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
    );
  });

  it('reports failure when the mutation threw', async () => {
    registerProductMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('rejects an empty name client-side without firing the mutation', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'adicionar' }));

    expect(screen.getByTestId('name-error')).toHaveTextContent('Introduza o nome.');
    expect(registerProductMock).not.toHaveBeenCalled();
  });
});

describe('useProductsViewModel — errors in pt-PT', () => {
  it('maps ProductAlreadyExistsError to the (nome, marca) copy', async () => {
    registerProductMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
    );
  });

  it('never surfaces the backend English message', async () => {
    registerProductMock.mockResolvedValue(conflictPayload);
    const { container } = renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(container.textContent).not.toContain('Product already exists');
  });

  it('maps a thrown BAD_USER_INPUT to the check-your-details copy', async () => {
    registerProductMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Invalid category', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.badInput);
  });

  it('maps a transport failure to the connection copy', async () => {
    registerProductMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });

    expect(screen.getByTestId('form-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.network);
  });

  it('clears the previous conflict on the next submit', async () => {
    registerProductMock
      .mockResolvedValueOnce(conflictPayload)
      .mockResolvedValueOnce(successPayload);
    renderHarness();

    await fillAndSubmit({ name: 'Nude Rosé', brand: 'OPI' });
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
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

    expect(screen.getByTestId('load-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.load);
    expect(container.textContent).not.toContain('Network request failed');
  });

  it('derives an empty list rather than crashing when the query returned nothing', () => {
    modelStateMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    renderHarness();

    expect(screen.getByTestId('product-ids')).toBeEmptyDOMElement();
  });
});
