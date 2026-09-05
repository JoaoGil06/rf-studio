import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ClientRowViewModel } from '../types/clientRow.types';
import { ClientRow } from './clientRow.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/clientRow.viewmodel', () => ({
  useClientRowViewModel: () => viewModelMock(),
}));

const maria: ClientRowViewModel = {
  name: 'Maria Silva',
  initial: 'M',
  phoneNumber: '912 345 678',
  email: 'maria@exemplo.pt',
  editLabel: 'Editar Maria Silva',
  deleteLabel: 'Remover Maria Silva',
};

function renderRow(overrides: { onEdit?: () => void; onDelete?: () => void } = {}) {
  return render(
    <ClientRow
      id="client-1"
      onEdit={overrides.onEdit ?? vi.fn()}
      onDelete={overrides.onDelete ?? vi.fn()}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ClientRow', () => {
  it('renders the name, the formatted telemóvel and the email', () => {
    viewModelMock.mockReturnValue(maria);

    renderRow();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('912 345 678')).toBeInTheDocument();
    expect(screen.getByText('maria@exemplo.pt')).toBeInTheDocument();
  });

  it('hides the avatar from assistive tech, since the name follows it', () => {
    viewModelMock.mockReturnValue(maria);

    const { container } = renderRow();

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('M');
  });

  it('shows no figures and no share actions it has no data for', () => {
    viewModelMock.mockReturnValue(maria);

    renderRow();

    expect(screen.queryByText(/VISITAS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/GASTO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fidelidade/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing while the fragment has not landed', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = renderRow();

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ClientRow — the actions', () => {
  it('reports the id upward when Editar is pressed', async () => {
    viewModelMock.mockReturnValue(maria);
    const onEdit = vi.fn();

    renderRow({ onEdit });
    await userEvent.click(screen.getByRole('button', { name: 'Editar Maria Silva' }));

    expect(onEdit).toHaveBeenCalledWith('client-1');
  });

  it('reports the id upward when Remover is pressed', async () => {
    viewModelMock.mockReturnValue(maria);
    const onDelete = vi.fn();

    renderRow({ onDelete });
    await userEvent.click(screen.getByRole('button', { name: 'Remover Maria Silva' }));

    expect(onDelete).toHaveBeenCalledWith('client-1');
  });

  it('keeps both actions in the DOM before the row is revealed', () => {
    viewModelMock.mockReturnValue(maria);

    renderRow();

    expect(screen.getByRole('button', { name: 'Editar Maria Silva' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Maria Silva' })).toBeInTheDocument();
  });

  it('reveals the actions when the row is tapped', async () => {
    viewModelMock.mockReturnValue(maria);

    const { container } = renderRow();
    const row = container.querySelector('article');
    expect(row?.className).not.toContain('rowRevealed');

    await userEvent.click(screen.getByText('Maria Silva'));

    expect(container.querySelector('article')?.className).toContain('rowRevealed');
  });

  it('does not toggle the row when an action is pressed', async () => {
    viewModelMock.mockReturnValue(maria);

    const { container } = renderRow();
    await userEvent.click(screen.getByRole('button', { name: 'Editar Maria Silva' }));

    expect(container.querySelector('article')?.className).not.toContain('rowRevealed');
  });

  it('names each action after the client it acts on', () => {
    viewModelMock.mockReturnValue(maria);

    renderRow();

    expect(screen.getByLabelText('Editar Maria Silva')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover Maria Silva')).toBeInTheDocument();
  });
});
