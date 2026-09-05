import { CombinedGraphQLErrors } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { stubIntersectionObserver } from '../../../test/intersectionObserver';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { useClientsViewModel } from './clients.viewmodel';

const registerClientMock = vi.fn();
const loadMoreMock = vi.fn();
const modelStateMock = vi.fn();

const submitResultMock = vi.fn();

vi.mock('../model/clients.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/clients.model')>()),
  useClientsModel: () => ({
    ...modelStateMock(),
    loadMore: loadMoreMock,
    registerClient: registerClientMock,
  }),
}));

function anEdge(id: string) {
  return { cursor: `cursor-${id}`, node: { id } };
}

const CONNECTION = {
  data: { users: { edges: [anEdge('c1'), anEdge('c3')] } },
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
  data: { registerUser: { __typename: 'RegisterUserSuccess', user: { id: 'c9' } } },
};

const conflictPayload = {
  data: { registerUser: { __typename: 'UserAlreadyExistsError', message: 'User already exists' } },
};

function Harness() {
  const {
    clientIds,
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
  } = useClientsViewModel();

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="client-ids">{clientIds.join(',')}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-loading-more">{String(isLoadingMore)}</span>
      <span data-testid="load-error">{loadError ?? ''}</span>

      <div ref={sentinelRef} />
      <button type="button" onClick={resetForm}>
        limpar
      </button>
      <span data-testid="form-error">{formError ?? ''}</span>
      <span data-testid="name-error">{errors.name?.message ?? ''}</span>
      <span data-testid="email-error">{errors.email?.message ?? ''}</span>
      <span data-testid="phone-error">{errors.phoneNumber?.message ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="email" {...register('email')} />
      <input aria-label="telemóvel" {...register('phoneNumber')} />

      <button type="submit">adicionar</button>
    </form>
  );
}

const VALID = { name: 'Maria Silva', email: 'maria@exemplo.pt', phone: '912345678' };

async function fillAndSubmit(values: { name?: string; email?: string; phone?: string } = {}) {
  const user = userEvent.setup();
  const filled = { ...VALID, ...values };

  if (filled.name) await user.type(screen.getByLabelText('nome'), filled.name);
  if (filled.email) await user.type(screen.getByLabelText('email'), filled.email);
  if (filled.phone) await user.type(screen.getByLabelText('telemóvel'), filled.phone);

  await user.click(screen.getByRole('button', { name: 'adicionar' }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  modelStateMock.mockReturnValue(CONNECTION);
  registerClientMock.mockResolvedValue(successPayload);
});

describe('useClientsViewModel — reading the book', () => {
  it('maps the whole connection, in order', () => {
    render(<Harness />);

    expect(screen.getByTestId('client-ids')).toHaveTextContent('c1,c3');
  });

  it('derives an empty list rather than crashing when the query returned nothing', () => {
    modelStateMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    render(<Harness />);

    expect(screen.getByTestId('client-ids')).toBeEmptyDOMElement();
  });

  it('maps a failed load to pt-PT copy rather than surfacing the Apollo error', () => {
    modelStateMock.mockReturnValue({ ...CONNECTION, error: new Error('Failed to fetch') });
    render(<Harness />);

    expect(screen.getByTestId('load-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.load);
  });

  it('reports no load error while the request is healthy', () => {
    render(<Harness />);

    expect(screen.getByTestId('load-error')).toBeEmptyDOMElement();
  });
});

describe('useClientsViewModel — wiring the sentinel to the Model', () => {
  it('asks the Model for the next page when the sentinel comes into view', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState());
    render(<Harness />);

    act(() => observers[0]?.fire());

    expect(loadMoreMock).toHaveBeenCalledTimes(1);
  });

  it('watches nothing while a page is already in flight', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState({ canLoadMore: false, isLoadingMore: true }));
    render(<Harness />);

    expect(observers).toHaveLength(0);
    expect(loadMoreMock).not.toHaveBeenCalled();
  });

  it('watches nothing once the last page has been read', () => {
    const observers = stubIntersectionObserver();
    modelStateMock.mockReturnValue(aPagedState({ canLoadMore: false }));
    render(<Harness />);

    expect(observers).toHaveLength(0);
    expect(loadMoreMock).not.toHaveBeenCalled();
  });

  it('tells a growing list apart from a first load', () => {
    modelStateMock.mockReturnValue(aPagedState({ isLoadingMore: true }));
    render(<Harness />);

    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('reports a first load as loading, so a slow page is not read as an empty book', () => {
    modelStateMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      isLoadingMore: false,
      canLoadMore: false,
    });
    render(<Harness />);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading-more')).toHaveTextContent('false');
  });
});

describe('useClientsViewModel — emptying the bar', () => {
  it('puts all three fields back to empty', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('nome'), 'Meio escrito');
    await user.type(screen.getByLabelText('email'), 'meio@exemplo.pt');
    await user.type(screen.getByLabelText('telemóvel'), '912345678');
    await user.click(screen.getByRole('button', { name: 'limpar' }));

    expect(screen.getByLabelText('nome')).toHaveValue('');
    expect(screen.getByLabelText('email')).toHaveValue('');
    expect(screen.getByLabelText('telemóvel')).toHaveValue('');
  });
});

describe('useClientsViewModel — registering a client', () => {
  /**
   * The assertion that pins the optional-password backend change to this page:
   * the client's surface is the ?hash= link, so no password is ever sent and the
   * backend generates one it never returns.
   */
  it('sends the three fields and never a password', async () => {
    render(<Harness />);

    await fillAndSubmit();

    expect(registerClientMock).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'Maria Silva',
          email: 'maria@exemplo.pt',
          phoneNumber: '912345678',
        },
      },
    });

    const input = registerClientMock.mock.calls[0]?.[0].variables.input;
    expect(input).not.toHaveProperty('password');
  });

  it('reports success once the client lands, so the bar may clear', async () => {
    render(<Harness />);

    await fillAndSubmit();

    expect(submitResultMock).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('form-error')).toBeEmptyDOMElement();
  });

  it('reports failure when the email is already in the book', async () => {
    registerClientMock.mockResolvedValue(conflictPayload);
    render(<Harness />);

    await fillAndSubmit();

    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('reports failure when the mutation threw', async () => {
    registerClientMock.mockRejectedValue(new Error('Failed to fetch'));
    render(<Harness />);

    await fillAndSubmit();

    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('reports failure when the mutation resolved with no data at all', async () => {
    registerClientMock.mockResolvedValue({ data: null });
    render(<Harness />);

    await fillAndSubmit();

    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.network);
  });

  it('rejects an empty nome client-side without firing the mutation', async () => {
    render(<Harness />);

    await fillAndSubmit({ name: '' });

    expect(screen.getByTestId('name-error')).toHaveTextContent('Introduza o nome.');
    expect(registerClientMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email client-side without firing the mutation', async () => {
    render(<Harness />);

    await fillAndSubmit({ email: 'nao-e-um-email' });

    expect(screen.getByTestId('email-error')).toHaveTextContent('Introduza um email válido.');
    expect(registerClientMock).not.toHaveBeenCalled();
  });

  it('rejects a too-short telemóvel client-side without firing the mutation', async () => {
    render(<Harness />);

    await fillAndSubmit({ phone: '91234' });

    expect(screen.getByTestId('phone-error')).toHaveTextContent(
      'Introduza um número com pelo menos 9 dígitos.',
    );
    expect(registerClientMock).not.toHaveBeenCalled();
  });
});

describe('useClientsViewModel — errors in pt-PT', () => {
  it('maps UserAlreadyExistsError to copy that names the email, since that is the key', async () => {
    registerClientMock.mockResolvedValue(conflictPayload);
    render(<Harness />);

    await fillAndSubmit();

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.alreadyExists);
  });

  it('never surfaces the backend English message', async () => {
    registerClientMock.mockResolvedValue(conflictPayload);
    const { container } = render(<Harness />);

    await fillAndSubmit();

    expect(container.textContent).not.toContain('User already exists');
  });

  it('maps a thrown BAD_USER_INPUT to the check-your-details copy', async () => {
    registerClientMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Invalid email', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    render(<Harness />);

    await fillAndSubmit();

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.badInput);
  });

  it('maps a transport failure to the connection copy', async () => {
    registerClientMock.mockRejectedValue(new Error('Failed to fetch'));
    render(<Harness />);

    await fillAndSubmit();

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.network);
  });
});
