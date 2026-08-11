import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createCache } from '../../../graphql/cache';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { PATHS } from '../../../routes/paths';
import { CATEGORY_PARAM } from '../../../utils/constants/productCategories';
import { findCategoryBySlug } from '../../../utils/helpers/productCategories';
import {
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_QUERY,
  REGISTER_PRODUCT_MUTATION,
} from '../model/products.model';
import { PRODUCT_ERROR_MESSAGES } from '../viewmodel/products.viewmodel';
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
                color: null,
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
                color: null,
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
