import { render, screen } from '@testing-library/react';
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ClientRow', () => {
  it('renders the name, the formatted telemóvel and the email', () => {
    viewModelMock.mockReturnValue(maria);

    render(<ClientRow id="client-1" />);

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('912 345 678')).toBeInTheDocument();
    expect(screen.getByText('maria@exemplo.pt')).toBeInTheDocument();
  });

  it('hides the avatar from assistive tech, since the name follows it', () => {
    viewModelMock.mockReturnValue(maria);

    const { container } = render(<ClientRow id="client-1" />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('M');
  });

  /**
   * The row promises four things the schema cannot pay for yet — VISITAS, GASTO,
   * Fidelidade and the ?hash= share actions. None may be invented.
   */
  it('shows no figures and no share actions it has no data for', () => {
    viewModelMock.mockReturnValue(maria);

    render(<ClientRow id="client-1" />);

    expect(screen.queryByText(/VISITAS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/GASTO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fidelidade/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing while the fragment has not landed', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ClientRow id="client-1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
