import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { useEditServiceModalViewModel } from './editServiceModal.viewmodel';

const updateServiceMock = vi.fn();
const serviceMock = vi.fn();

vi.mock('../model/editServiceModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/editServiceModal.model')>()),
  useEditServiceModalModel: (serviceId: string | null) => ({
    service: serviceMock(serviceId),
    updateService: updateServiceMock,
    isSaving: false,
  }),
}));

function aService(overrides: Record<string, unknown> = {}) {
  return {
    __typename: 'Service',
    id: 's1',
    name: 'Manicure simples',
    price: 15,
    durationMinutes: 45,
    ...overrides,
  };
}

const successPayload = {
  data: { updateService: { __typename: 'UpdateServiceSuccess', service: aService() } },
};

const conflictPayload = {
  data: {
    updateService: {
      __typename: 'ServiceAlreadyExistsError',
      message: 'Service already registered',
    },
  },
};

const notFoundPayload = {
  data: {
    updateService: { __typename: 'ServiceNotFoundError', message: 'Service not found' },
  },
};

const submitResultMock = vi.fn();

function Harness({ initialId }: { initialId: string | null }) {
  const [serviceId, setServiceId] = useState(initialId);
  const { title, register, handleSubmit, submit, formError } =
    useEditServiceModalViewModel(serviceId);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="title">{title}</span>
      <span data-testid="form-error">{formError ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="preco" type="number" {...register('price', { valueAsNumber: true })} />
      <input
        aria-label="duracao"
        type="number"
        {...register('durationMinutes', { valueAsNumber: true })}
      />

      <button type="button" onClick={() => setServiceId('s2')}>
        apontar para s2
      </button>
      <button type="submit">guardar</button>
    </form>
  );
}

function renderHarness(initialId: string | null = 's1') {
  return render(<Harness initialId={initialId} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  serviceMock.mockImplementation((id: string | null) => (id ? aService({ id }) : null));
  updateServiceMock.mockResolvedValue(successPayload);
});

describe('useEditServiceModalViewModel — prefilling from the cache', () => {
  it('fills every field from the service it is pointed at', () => {
    renderHarness();

    expect(screen.getByLabelText('nome')).toHaveValue('Manicure simples');
    expect(screen.getByLabelText('preco')).toHaveValue(15);
    expect(screen.getByLabelText('duracao')).toHaveValue(45);
  });

  // Both service categories carry `noun: 'serviço'`, so the title is a constant
  // rather than a lookup that would always produce the same string.
  it('titles itself without consulting the category', () => {
    renderHarness();

    expect(screen.getByTestId('title')).toHaveTextContent('Editar serviço');
  });

  it('reads nothing at all while it is closed', () => {
    renderHarness(null);

    expect(screen.getByLabelText('nome')).toHaveValue('');
  });

  it('re-prefills when it is pointed at a different service', async () => {
    serviceMock.mockImplementation((id: string | null) =>
      id === 's2'
        ? aService({ id: 's2', name: 'Pedicure', price: 22, durationMinutes: 60 })
        : aService(),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'apontar para s2' }));

    expect(screen.getByLabelText('nome')).toHaveValue('Pedicure');
    expect(screen.getByLabelText('preco')).toHaveValue(22);
    expect(screen.getByLabelText('duracao')).toHaveValue(60);
  });
});

describe('useEditServiceModalViewModel — submitting', () => {
  it('sends a full three-field payload carrying the id, and never the category', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(updateServiceMock).toHaveBeenCalledWith({
      variables: {
        input: { id: 's1', name: 'Manicure simples', price: 15, durationMinutes: 45 },
      },
    });
    expect(updateServiceMock.mock.calls[0]?.[0].variables.input).not.toHaveProperty('category');
  });

  it('reports success so the View can close the modal', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(submitResultMock).toHaveBeenCalledWith(true);
  });

  it('does nothing at all while it has no service to save', async () => {
    renderHarness(null);

    await userEvent.setup().type(screen.getByLabelText('nome'), 'Qualquer');
    await userEvent.setup().type(screen.getByLabelText('preco'), '10');
    await userEvent.setup().type(screen.getByLabelText('duracao'), '30');
    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(updateServiceMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });
});

describe('useEditServiceModalViewModel — mapping failures to pt-PT', () => {
  it('maps a name that already exists in this category', async () => {
    updateServiceMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SERVICE_ERROR_MESSAGES.alreadyExists,
    );
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('maps a service that is already gone', async () => {
    updateServiceMock.mockResolvedValue(notFoundPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.notFound);
  });

  it('maps a missing result to the transport message', async () => {
    updateServiceMock.mockResolvedValue({ data: null });
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.network);
  });

  it('maps a thrown BAD_USER_INPUT to the validation message', async () => {
    updateServiceMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'invalid', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.badInput);
  });

  it('maps any other thrown error to the transport message', async () => {
    updateServiceMock.mockRejectedValue(new Error('offline'));
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(SERVICE_ERROR_MESSAGES.network);
  });
});
