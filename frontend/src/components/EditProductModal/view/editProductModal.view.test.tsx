import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { PRODUCT_EDIT_FRAGMENT, UPDATE_PRODUCT_MUTATION } from '../model/editProductModal.model';
import { EditProductModal } from './editProductModal.view';

function aProduct(overrides: Record<string, unknown> = {}) {
  return {
    __typename: 'Product',
    id: 'p1',
    name: 'Nude Rosé',
    brand: 'OPI',
    category: 'nails',
    color: '#c9a08a',
    isAvailable: true,
    ...overrides,
  };
}

const onClose = vi.fn();

function renderModal(
  productId: string | null,
  product: Record<string, unknown> | null = aProduct(),
  mocks: MockedResponse[] = [],
) {
  const cache = createCache();

  if (product) {
    cache.writeFragment({
      id: cache.identify({ __typename: 'Product', id: product.id as string }),
      fragment: PRODUCT_EDIT_FRAGMENT,
      fragmentName: 'ProductEditFields',
      data: product,
    });
  }

  return render(
    <MockedProvider mocks={mocks} cache={cache}>
      <EditProductModal productId={productId} onClose={onClose} />
    </MockedProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EditProductModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when the id points at a product the cache no longer holds', () => {
    const { container } = renderModal('p9', null);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens on the product it was handed, every field filled', async () => {
    renderModal('p1');

    const sheet = await screen.findByRole('dialog', { name: 'Editar verniz' });
    expect(within(sheet).getByLabelText('Nome')).toHaveValue('Nude Rosé');
    expect(within(sheet).getByLabelText('Marca')).toHaveValue('OPI');
    expect(within(sheet).getByLabelText('Cor do verniz')).toHaveValue('#c9a08a');
  });

  it('gives a verniz a colour well and a brows product a text field', async () => {
    const { unmount } = renderModal('p1');

    expect(await screen.findByLabelText('Cor do verniz')).toHaveAttribute('type', 'color');

    unmount();
    renderModal(
      'p2',
      aProduct({ id: 'p2', category: 'eyebrows', color: 'Castanho médio', name: 'Castanho' }),
    );

    const tom = await screen.findByLabelText('Tom');
    expect(tom).toHaveAttribute('type', 'text');
    expect(tom).toHaveValue('Castanho médio');
  });

  it('titles a brows product after its own noun', async () => {
    renderModal('p2', aProduct({ id: 'p2', category: 'eyebrows', color: 'Loiro' }));

    expect(await screen.findByRole('dialog', { name: 'Editar produto' })).toBeInTheDocument();
  });

  it('puts no category control on screen', async () => {
    renderModal('p1');

    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).queryByRole('button', { name: 'UNHAS' })).not.toBeInTheDocument();
    expect(within(sheet).queryByRole('button', { name: 'SOBRANCELHAS' })).not.toBeInTheDocument();
    expect(within(sheet).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(sheet).queryByLabelText(/categoria/i)).not.toBeInTheDocument();
  });

  it('reads GUARDAR rather than ADICIONAR', async () => {
    renderModal('p1');

    expect(await screen.findByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ADICIONAR' })).not.toBeInTheDocument();
  });

  it('closes itself once the save lands', async () => {
    const user = userEvent.setup();
    renderModal('p1', aProduct(), [
      {
        request: {
          query: UPDATE_PRODUCT_MUTATION,
          variables: {
            input: {
              id: 'p1',
              name: 'Nude Rosé escuro',
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
              product: aProduct({ name: 'Nude Rosé escuro' }),
            },
          },
        },
      },
    ]);

    await user.clear(await screen.findByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'Nude Rosé escuro');
    await user.click(screen.getByRole('button', { name: 'GUARDAR' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open with the error inside it when the save was rejected', async () => {
    const user = userEvent.setup();
    renderModal('p1', aProduct(), [
      {
        request: {
          query: UPDATE_PRODUCT_MUTATION,
          variables: {
            input: {
              id: 'p1',
              name: 'Bordeaux',
              brand: 'OPI',
              color: '#c9a08a',
              isAvailable: true,
            },
          },
        },
        result: {
          data: {
            updateProduct: {
              __typename: 'ProductAlreadyExistsError',
              message: 'Product already exists',
            },
          },
        },
      },
    ]);

    await user.clear(await screen.findByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'Bordeaux');
    await user.click(screen.getByRole('button', { name: 'GUARDAR' }));

    const sheet = await screen.findByRole('dialog', { name: 'Editar verniz' });
    expect(await within(sheet).findByRole('alert')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('refuses to save a colourless product until a colour is given', async () => {
    renderModal('p2', aProduct({ id: 'p2', category: 'eyebrows', color: null }));

    await userEvent.setup().click(await screen.findByRole('button', { name: 'GUARDAR' }));

    expect(await screen.findByText('Introduza a cor.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
