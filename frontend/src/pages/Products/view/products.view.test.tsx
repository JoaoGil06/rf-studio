import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DELETE_PRODUCT_MUTATION } from '../../../components/DeleteProductModal/model/deleteProductModal.model';
import { UPDATE_PRODUCT_MUTATION } from '../../../components/EditProductModal/model/editProductModal.model';
import { createCache } from '../../../graphql/cache';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { PATHS } from '../../../routes/paths';
import { CATEGORY_PARAM } from '../../../utils/constants/productCategories';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { findCategoryBySlug } from '../../../utils/helpers/productCategories';
import {
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_QUERY,
  REGISTER_PRODUCT_MUTATION,
} from '../model/products.model';
import { ProductsView } from './products.view';

function aNode(id: string, name: string, brand: string, category: string, color: string | null) {
  return {
    __typename: 'Product',
    id,
    name,
    brand,
    category,
    color,
    isAvailable: true,
  };
}

function aConnection(nodes: ReturnType<typeof aNode>[], hasNextPage = false) {
  return {
    products: {
      __typename: 'ProductConnection',
      edges: nodes.map((node) => ({
        __typename: 'ProductEdge',
        cursor: `cursor-${node.id}`,
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage,
        endCursor: nodes.length ? `cursor-${nodes[nodes.length - 1]?.id}` : null,
      },
    },
  };
}

const NUDE = aNode('p1', 'Nude Rosé', 'OPI', 'nails', '#c9a08a');
const CASTANHO = aNode('p2', 'Castanho médio', 'Anastasia', 'eyebrows', 'Castanho médio');
const BORDEAUX = aNode('p3', 'Bordeaux', 'Essie', 'nails', '#5b1a2b');
const LOIRO = aNode('p4', 'Loiro', 'Benefit', 'eyebrows', null);

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The category the page will query for, resolved with the app's own helper so the
 * mocks cannot drift from what the URL actually means.
 */
function categoryFor(search: string) {
  return findCategoryBySlug(new URLSearchParams(search).get(CATEGORY_PARAM)).value;
}

function renderPage(
  result: { data: unknown } | { error: Error },
  search = '',
  nodes: ReturnType<typeof aNode>[] = [NUDE],
  extraMocks: MockedResponse[] = [],
) {
  const mocks = [
    {
      // MockedProvider matches on exact variables, so every test that renders a
      // card is also asserting the query carried the right category.
      request: {
        query: PRODUCTS_QUERY,
        variables: { first: PRODUCTS_PAGE_SIZE, category: categoryFor(search) },
      },
      result: 'data' in result ? { data: result.data ?? aConnection(nodes) } : undefined,
      error: 'error' in result ? result.error : undefined,
    },
    ...extraMocks,
  ];

  return render(
    <MockedProvider mocks={mocks} cache={createCache()}>
      <MemoryRouter initialEntries={[`${PATHS.products}${search}`]}>
        <ProductsView />
      </MemoryRouter>
    </MockedProvider>,
  );
}

describe('ProductsView', () => {
  it('renders the page heading and both tabs, pressing the URL’s category', async () => {
    renderPage({ data: aConnection([CASTANHO]) }, '?categoria=sobrancelhas');

    expect(screen.getByRole('heading', { name: 'Produtos' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'SOBRANCELHAS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'UNHAS' })).toHaveAttribute('aria-pressed', 'false');
  });

  /**
   * The mock is registered for `category: 'eyebrows'` only. If the page asked for the
   * whole catalogue — as it did while the filter lived on the client — no mock would
   * match and this card would never arrive.
   */
  it('queries for the URL’s category and renders what comes back', async () => {
    renderPage({ data: aConnection([CASTANHO]) }, '?categoria=sobrancelhas');

    expect(await screen.findByText('Castanho médio')).toBeInTheDocument();
  });

  it('keeps the add form out of the grid until it is asked for', async () => {
    renderPage({ data: aConnection([NUDE]) });

    expect(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('opens the add form in a sheet, with no category control on it', async () => {
    renderPage({ data: aConnection([NUDE]) });

    await userEvent.setup().click(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' }));

    const sheet = screen.getByRole('dialog', { name: 'Novo verniz' });
    expect(within(sheet).getByLabelText('Nome')).toBeInTheDocument();
    expect(within(sheet).getByLabelText('Marca')).toBeInTheDocument();
    // The category rides in from the active tab; the sheet never asks for it.
    expect(within(sheet).queryByRole('button', { name: 'UNHAS' })).not.toBeInTheDocument();
    expect(within(sheet).queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('titles the sheet after the active tab', async () => {
    renderPage({ data: aConnection([CASTANHO]) }, '?categoria=sobrancelhas');

    await userEvent.setup().click(await screen.findByRole('button', { name: 'ADICIONAR PRODUTO' }));

    expect(screen.getByRole('dialog', { name: 'Novo produto' })).toBeInTheDocument();
  });

  it('closes the sheet again without leaving the page', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) });

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' }));
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Nude Rosé')).toBeInTheDocument();
  });

  // Closing is a decision not to add this one: half a product typed and abandoned
  // must not be waiting inside the sheet the next time it opens.
  it('empties an abandoned form before the sheet is opened again', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) });

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' }));
    await user.type(screen.getByLabelText('Nome'), 'Meio escrito');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    await user.click(screen.getByRole('button', { name: 'ADICIONAR VERNIZ' }));

    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  /**
   * `useForm` captures `defaultValues` on mount, so a tab switch after that would
   * leave the add form holding the previous category's default — `#000000` sitting
   * in a brows text field, or an empty required swatch. Opening re-derives it.
   */
  it('opens the add sheet on the active category’s colour default', async () => {
    const user = userEvent.setup();
    renderPage(
      { data: aConnection([NUDE]) },
      '',
      [NUDE],
      [
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, category: 'eyebrows' },
          },
          result: { data: aConnection([CASTANHO]) },
        },
      ],
    );

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' }));
    expect(screen.getByLabelText('Cor do verniz')).toHaveValue('#000000');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    await user.click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));
    await user.click(await screen.findByRole('button', { name: 'ADICIONAR PRODUTO' }));

    expect(screen.getByLabelText('Tom')).toHaveValue('');
  });

  it('closes the sheet once the product lands, so the new card is in view', async () => {
    const user = userEvent.setup();
    renderPage(
      { data: aConnection([CASTANHO]) },
      '?categoria=sobrancelhas',
      [CASTANHO],
      [
        {
          request: {
            query: REGISTER_PRODUCT_MUTATION,
            variables: {
              input: {
                name: 'Loiro',
                brand: 'Benefit',
                color: 'Loiro claro',
                isAvailable: true,
                category: 'eyebrows',
              },
            },
          },
          result: {
            data: { registerProduct: { __typename: 'RegisterProductSuccess', product: LOIRO } },
          },
        },
        // awaitRefetchQueries: the grid behind the sheet is rebuilt before it closes.
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, category: 'eyebrows' },
          },
          result: { data: aConnection([CASTANHO, LOIRO]) },
        },
      ],
    );

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR PRODUTO' }));
    await user.type(screen.getByLabelText('Nome'), 'Loiro');
    await user.type(screen.getByLabelText('Marca'), 'Benefit');
    await user.type(screen.getByLabelText('Tom'), 'Loiro claro');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(await screen.findByText('Loiro')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves the sheet open when the product was rejected, with the error inside it', async () => {
    const user = userEvent.setup();
    renderPage(
      { data: aConnection([CASTANHO]) },
      '?categoria=sobrancelhas',
      [CASTANHO],
      [
        {
          request: {
            query: REGISTER_PRODUCT_MUTATION,
            variables: {
              input: {
                name: 'Castanho médio',
                brand: 'Anastasia',
                color: 'Castanho médio',
                isAvailable: true,
                category: 'eyebrows',
              },
            },
          },
          result: {
            data: {
              registerProduct: {
                __typename: 'ProductAlreadyExistsError',
                message: 'Product already exists',
              },
            },
          },
        },
        // The refetch fires on any answered mutation, rejection included; without a
        // mock for it `awaitRefetchQueries` would fail and mask the real error copy.
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, category: 'eyebrows' },
          },
          result: { data: aConnection([CASTANHO]) },
        },
      ],
    );

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR PRODUTO' }));
    await user.type(screen.getByLabelText('Nome'), 'Castanho médio');
    await user.type(screen.getByLabelText('Marca'), 'Anastasia');
    await user.type(screen.getByLabelText('Tom'), 'Castanho médio');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    const sheet = await screen.findByRole('dialog', { name: 'Novo produto' });
    expect(await within(sheet).findByRole('alert')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
    );
  });

  it('keeps the add tile reachable when the category is empty', async () => {
    renderPage({ data: aConnection([]) });

    expect(await screen.findByText('Ainda sem verniz.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ADICIONAR VERNIZ' })).toBeInTheDocument();
  });

  it('maps a failed query to pt-PT copy and never renders the Apollo error', async () => {
    const { container } = renderPage({ error: new Error('Network request failed') });

    expect(await screen.findByRole('alert')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.load);
    expect(container.textContent).not.toContain('Network request failed');
    // A failed query is an error, not an empty shelf — the two must not both show.
    expect(screen.queryByText(/^Ainda sem/)).not.toBeInTheDocument();
  });

  // The sentinel unmounting is what ends the paging: with no element left to watch
  // there is no observer, so nothing can ask for a page that does not exist.
  it('watches nothing once the last page is in', async () => {
    const observers = stubIntersectionObserver();
    renderPage({ data: aConnection([NUDE]) });

    expect(await screen.findByText('Nude Rosé')).toBeInTheDocument();
    expect(observers).toHaveLength(0);
  });

  it('watches a sentinel while pages remain', async () => {
    const observers = stubIntersectionObserver();
    renderPage({ data: aConnection([NUDE], true) });

    expect(await screen.findByText('Nude Rosé')).toBeInTheDocument();
    expect(observers.some((entry) => entry.target !== null)).toBe(true);
  });

  // Nothing to click and nothing to read: the sentinel says nothing to a screen
  // reader, so the page must announce the arriving batch some other way.
  it('announces a page on its way, politely', async () => {
    const observers = stubIntersectionObserver();
    renderPage(
      { data: aConnection([NUDE], true) },
      '',
      [NUDE],
      [
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, after: 'cursor-p1', category: 'nails' },
          },
          result: { data: aConnection([BORDEAUX]) },
          delay: 20,
        },
      ],
    );

    expect(await screen.findByText('Nude Rosé')).toBeInTheDocument();
    act(() => observers[0]?.fire());

    expect(await screen.findByRole('status')).toHaveTextContent('A carregar…');
    expect(await screen.findByText('Bordeaux')).toBeInTheDocument();
  });

  /**
   * The regression this change exists for. While the filter lived on the client,
   * switching to an empty tab left `hasNextPage` true: the sentinel sat unmoved at
   * the top of an empty grid, the observer fired on it again and again, and the page
   * read the entire catalogue of vernizes before it could say "Ainda sem produto".
   * With the filter in SQL, one request answers the question.
   */
  it('says the category is empty after one request, without paging the catalogue', async () => {
    const observers = stubIntersectionObserver();
    const user = userEvent.setup();
    renderPage(
      { data: aConnection([NUDE]) },
      '',
      [NUDE],
      [
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, category: 'eyebrows' },
          },
          result: { data: aConnection([]) },
        },
      ],
    );

    expect(await screen.findByText('Nude Rosé')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));

    expect(await screen.findByText('Ainda sem produto.')).toBeInTheDocument();
    /**
     * The absence of a sentinel is the fix itself: with nothing to observe there is
     * no second request to make. And were one made anyway it would find no matching
     * mock and fail this test.
     */
    expect(observers.filter((entry) => entry.target !== null)).toHaveLength(0);
  });

  it('does not claim an empty shelf while the first page is still in flight', () => {
    // Synchronous on purpose: MockedProvider has not answered yet at this point, so
    // an empty grid here means "not back", not "nothing there".
    renderPage({ data: aConnection([]) }, '?categoria=sobrancelhas');

    expect(screen.queryByText('Ainda sem produto.')).not.toBeInTheDocument();
  });

  it('gives every card its own pair of named actions', async () => {
    renderPage({ data: aConnection([NUDE, BORDEAUX]) }, '', [NUDE, BORDEAUX]);

    expect(await screen.findByRole('button', { name: 'Editar Nude Rosé' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Nude Rosé' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Bordeaux' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Bordeaux' })).toBeInTheDocument();
  });

  it('opens the edit sheet prefilled with the card that was pressed', async () => {
    renderPage({ data: aConnection([NUDE, BORDEAUX]) }, '', [NUDE, BORDEAUX]);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Editar Bordeaux' }));

    const sheet = screen.getByRole('dialog', { name: 'Editar verniz' });
    expect(within(sheet).getByLabelText('Nome')).toHaveValue('Bordeaux');
    expect(within(sheet).getByLabelText('Marca')).toHaveValue('Essie');
    expect(within(sheet).getByLabelText('Cor do verniz')).toHaveValue('#5b1a2b');
  });

  /**
   * One sheet serves the whole grid, so re-pointing it is the mechanism — the
   * prefill has to follow the id rather than stick to whichever card came first.
   */
  it('re-points the sheet when a different card is edited afterwards', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE, BORDEAUX]) }, '', [NUDE, BORDEAUX]);

    await user.click(await screen.findByRole('button', { name: 'Editar Nude Rosé' }));
    expect(screen.getByLabelText('Nome')).toHaveValue('Nude Rosé');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    await user.click(screen.getByRole('button', { name: 'Editar Bordeaux' }));

    expect(screen.getByLabelText('Nome')).toHaveValue('Bordeaux');
  });

  /**
   * The point of the whole no-refetch design: `updateProduct` returns the full
   * Product, Apollo renormalises it by id, and the card re-renders through its own
   * useFragment. No `Products` mock is registered for a second query — if the page
   * refetched, there would be no mock to answer it and this test would fail.
   */
  it('updates the card in the grid without refetching the page', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) }, '', [NUDE], [
      {
        request: {
          query: UPDATE_PRODUCT_MUTATION,
          variables: {
            input: {
              id: 'p1',
              name: 'Nude Rosé Escuro',
              brand: 'OPI',
              color: '#c9a08a',
              isAvailable: true,
            },
          },
        },
        result: {
          data: {
            updateProduct: {
              __typename: 'UpdateProductSuccess',
              product: aNode('p1', 'Nude Rosé Escuro', 'OPI', 'nails', '#c9a08a'),
            },
          },
        },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Editar Nude Rosé' }));
    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'Nude Rosé Escuro');
    await user.click(screen.getByRole('button', { name: 'GUARDAR' }));

    expect(await screen.findByText('Nude Rosé Escuro')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the confirmation naming the card that was pressed', async () => {
    renderPage({ data: aConnection([NUDE, BORDEAUX]) }, '', [NUDE, BORDEAUX]);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Remover Bordeaux' }));

    const dialog = screen.getByRole('dialog', { name: 'Remover produto' });
    expect(dialog).toHaveTextContent('Remover Bordeaux?');
  });

  it('leaves the card in the grid when MANTER is pressed', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) }, '', [NUDE]);

    await user.click(await screen.findByRole('button', { name: 'Remover Nude Rosé' }));
    await user.click(screen.getByRole('button', { name: 'MANTER' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Nude Rosé')).toBeInTheDocument();
  });

  // evict + gc, then `relayStylePagination`'s `canRead` drops the dangling edge on
  // the next read. Again: no second `Products` mock, so a refetch would fail here.
  it('takes the card out of the grid when REMOVER is pressed', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE, BORDEAUX]) }, '', [NUDE, BORDEAUX], [
      {
        request: { query: DELETE_PRODUCT_MUTATION, variables: { input: { id: 'p1' } } },
        result: { data: { deleteProduct: { __typename: 'DeleteProductSuccess', id: 'p1' } } },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Remover Nude Rosé' }));
    await user.click(screen.getByRole('button', { name: 'REMOVER' }));

    await vi.waitFor(() => expect(screen.queryByText('Nude Rosé')).not.toBeInTheDocument());
    expect(screen.getByText('Bordeaux')).toBeInTheDocument();
  });

  it('falls back to the empty shelf when the last product of a category goes', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) }, '', [NUDE], [
      {
        request: { query: DELETE_PRODUCT_MUTATION, variables: { input: { id: 'p1' } } },
        result: { data: { deleteProduct: { __typename: 'DeleteProductSuccess', id: 'p1' } } },
      },
    ]);

    await user.click(await screen.findByRole('button', { name: 'Remover Nude Rosé' }));
    await user.click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(await screen.findByText('Ainda sem verniz.')).toBeInTheDocument();
  });

  /**
   * What the `opacity: 0` buttons staying mounted buys. `Modal` restores focus to
   * whatever was active when it opened; had the action row been conditionally
   * rendered, its opener would have unmounted and focus would fall to <body>.
   */
  it('returns focus to the control that opened the sheet', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) }, '', [NUDE]);

    const edit = await screen.findByRole('button', { name: 'Editar Nude Rosé' });
    edit.focus();
    await user.click(edit);
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    await vi.waitFor(() => expect(edit).toHaveFocus());
  });

  // The add flow and the two new sheets share a page and must not share a modal.
  it('leaves the add flow untouched by the two new sheets', async () => {
    const user = userEvent.setup();
    renderPage({ data: aConnection([NUDE]) }, '', [NUDE]);

    await user.click(await screen.findByRole('button', { name: 'ADICIONAR VERNIZ' }));

    expect(screen.getByRole('dialog', { name: 'Novo verniz' })).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'ADICIONAR' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'GUARDAR' })).not.toBeInTheDocument();
  });

  it('loads the next page when the sentinel approaches the viewport', async () => {
    const observers = stubIntersectionObserver();

    renderPage(
      { data: aConnection([NUDE], true) },
      '',
      [NUDE],
      [
        {
          request: {
            query: PRODUCTS_QUERY,
            variables: { first: PRODUCTS_PAGE_SIZE, after: 'cursor-p1', category: 'nails' },
          },
          result: { data: aConnection([BORDEAUX]) },
        },
      ],
    );

    expect(await screen.findByText('Nude Rosé')).toBeInTheDocument();
    expect(screen.queryByText('Bordeaux')).not.toBeInTheDocument();

    const [observer] = observers;
    expect(observer?.target).not.toBeNull();

    act(() => observer?.fire());

    expect(await screen.findByText('Bordeaux')).toBeInTheDocument();
  });
});
