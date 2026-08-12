import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { useEditProductModalViewModel } from './editProductModal.viewmodel';

const updateProductMock = vi.fn();
const productMock = vi.fn();

vi.mock('../model/editProductModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/editProductModal.model')>()),
  useEditProductModalModel: (productId: string | null) => ({
    product: productMock(productId),
    updateProduct: updateProductMock,
    isSaving: false,
  }),
}));

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

const successPayload = {
  data: { updateProduct: { __typename: 'UpdateProductSuccess', product: aProduct() } },
};

const conflictPayload = {
  data: {
    updateProduct: {
      __typename: 'ProductAlreadyExistsError',
      message: 'Product already exists',
    },
  },
};

const notFoundPayload = {
  data: {
    updateProduct: { __typename: 'ProductNotFoundError', message: 'Product not found' },
  },
};

const submitResultMock = vi.fn();

function Harness({ initialId }: { initialId: string | null }) {
  const [productId, setProductId] = useState(initialId);
  const { category, title, register, handleSubmit, submit, errors, formError } =
    useEditProductModalViewModel(productId);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="title">{title}</span>
      <span data-testid="category">{category?.value ?? ''}</span>
      <span data-testid="form-error">{formError ?? ''}</span>
      <span data-testid="color-error">{errors.color?.message ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="marca" {...register('brand')} />
      <input aria-label="cor" {...register('color')} />
      <input aria-label="disponivel" type="checkbox" {...register('isAvailable')} />

      <button type="button" onClick={() => setProductId('p2')}>
        apontar para p2
      </button>
      <button type="submit">guardar</button>
    </form>
  );
}

function renderHarness(initialId: string | null = 'p1') {
  return render(<Harness initialId={initialId} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  productMock.mockImplementation((id: string | null) => (id ? aProduct({ id }) : null));
  updateProductMock.mockResolvedValue(successPayload);
});

describe('useEditProductModalViewModel — prefilling from the cache', () => {
  it('fills every field from the product it is pointed at', () => {
    renderHarness();

    expect(screen.getByLabelText('nome')).toHaveValue('Nude Rosé');
    expect(screen.getByLabelText('marca')).toHaveValue('OPI');
    expect(screen.getByLabelText('cor')).toHaveValue('#c9a08a');
    expect(screen.getByLabelText('disponivel')).toBeChecked();
  });

  it('shows a colourless product as colourless, never as black', () => {
    productMock.mockReturnValue(aProduct({ color: null }));

    renderHarness();

    expect(screen.getByLabelText('cor')).toHaveValue('');
  });

  it('takes the category from the product, not from a prop', () => {
    productMock.mockReturnValue(aProduct({ category: 'eyebrows' }));

    renderHarness();

    expect(screen.getByTestId('category')).toHaveTextContent('eyebrows');
    expect(screen.getByTestId('title')).toHaveTextContent('Editar produto');
  });

  it('titles a verniz after its own noun', () => {
    renderHarness();

    expect(screen.getByTestId('title')).toHaveTextContent('Editar verniz');
  });

  it('reads nothing at all while it is closed', () => {
    renderHarness(null);

    expect(screen.getByTestId('category')).toBeEmptyDOMElement();
    expect(screen.getByLabelText('nome')).toHaveValue('');
  });

  it('re-prefills when it is pointed at a different product', async () => {
    productMock.mockImplementation((id: string | null) =>
      id === 'p2' ? aProduct({ id: 'p2', name: 'Bordeaux', brand: 'Essie' }) : aProduct(),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'apontar para p2' }));

    expect(screen.getByLabelText('nome')).toHaveValue('Bordeaux');
    expect(screen.getByLabelText('marca')).toHaveValue('Essie');
  });

  it('does not stamp over what is being typed when the cache writes again', async () => {
    const user = userEvent.setup();
    const { rerender } = renderHarness();

    await user.clear(screen.getByLabelText('nome'));
    await user.type(screen.getByLabelText('nome'), 'Meio escrito');

    productMock.mockReturnValue(aProduct({ name: 'Renomeado noutro sítio' }));
    rerender(<Harness initialId="p1" />);

    expect(screen.getByLabelText('nome')).toHaveValue('Meio escrito');
  });
});

describe('useEditProductModalViewModel — submitting', () => {
  it('sends the full payload with the product’s id', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(updateProductMock).toHaveBeenCalledWith({
      variables: {
        input: {
          id: 'p1',
          name: 'Nude Rosé',
          brand: 'OPI',
          color: '#c9a08a',
          isAvailable: true,
        },
      },
    });
  });

  it('never sends a category', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    const [call] = updateProductMock.mock.calls;
    expect(call?.[0].variables.input).not.toHaveProperty('category');
  });

  it('reports success so the View can close the modal', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(submitResultMock).toHaveBeenCalledWith(true);
  });

  it('blocks a submit with no colour, without firing the mutation', async () => {
    productMock.mockReturnValue(aProduct({ category: 'eyebrows', color: null }));
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('color-error')).toHaveTextContent('Introduza a cor.');
    expect(updateProductMock).not.toHaveBeenCalled();
  });
});

describe('useEditProductModalViewModel — errors in pt-PT', () => {
  it('maps a (nome, marca) conflict to the copy the add flow already uses', async () => {
    updateProductMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      PRODUCT_ERROR_MESSAGES.alreadyExists,
    );
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('maps a vanished product to the not-found copy', async () => {
    updateProductMock.mockResolvedValue(notFoundPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.notFound);
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('maps a thrown BAD_USER_INPUT to the check-your-details copy', async () => {
    updateProductMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Invalid colour', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.badInput);
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('maps a transport failure to the connection copy', async () => {
    updateProductMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(PRODUCT_ERROR_MESSAGES.network);
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('never surfaces the backend English message', async () => {
    updateProductMock.mockResolvedValue(conflictPayload);
    const { container } = renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(container.textContent).not.toContain('Product already exists');
  });
});
