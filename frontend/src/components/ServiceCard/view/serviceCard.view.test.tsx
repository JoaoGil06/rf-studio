import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ServiceCardViewModel } from '../types/serviceCard.types';
import { ServiceCard } from './serviceCard.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/serviceCard.viewmodel', () => ({
  useServiceCardViewModel: () => viewModelMock(),
}));

const PRICE = '15,00 €';

const manicure: ServiceCardViewModel = {
  name: 'Manicure simples',
  initial: 'M',
  metaLabel: 'UNHAS · 45 MIN',
  price: PRICE,
  editLabel: 'Editar Manicure simples',
  deleteLabel: 'Remover Manicure simples',
};

const onEdit = vi.fn();
const onDelete = vi.fn();

function renderCard() {
  return render(<ServiceCard id="service-1" onEdit={onEdit} onDelete={onDelete} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ServiceCard', () => {
  it('renders the name, the meta line and the price', () => {
    viewModelMock.mockReturnValue(manicure);

    renderCard();

    expect(screen.getByText('Manicure simples')).toBeInTheDocument();
    expect(screen.getByText(manicure.metaLabel)).toBeInTheDocument();
    expect(screen.getByText('15,00 €')).toBeInTheDocument();
  });

  it('hides the initial tile from assistive tech, since the name follows it', () => {
    viewModelMock.mockReturnValue(manicure);

    const { container } = renderCard();

    expect(container.querySelector('span[aria-hidden="true"]')).toHaveTextContent('M');
  });

  it('renders nothing while the fragment has not landed', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = renderCard();

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ServiceCard — the reveal layer', () => {
  beforeEach(() => {
    viewModelMock.mockReturnValue(manicure);
  });

  it('carries both actions, each named after the service', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Editar Manicure simples' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Manicure simples' })).toBeInTheDocument();
  });

  it('reports this card’s id when the pencil is pressed, and nothing else', async () => {
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Editar Manicure simples' }));

    expect(onEdit).toHaveBeenCalledWith('service-1');
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('reports this card’s id when the cross is pressed, and nothing else', async () => {
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Remover Manicure simples' }));

    expect(onDelete).toHaveBeenCalledWith('service-1');
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('toggles the revealed class on a tap, and off again on the next one', async () => {
    const user = userEvent.setup();
    const { container } = renderCard();

    const card = container.querySelector('article');
    expect(card).not.toHaveClass(/cardRevealed/);

    await user.click(screen.getByText('Manicure simples'));
    expect(card).toHaveClass(/cardRevealed/);

    await user.click(screen.getByText('Manicure simples'));
    expect(card).not.toHaveClass(/cardRevealed/);
  });

  it('does not toggle the card when an action is pressed', async () => {
    const { container } = renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Editar Manicure simples' }));

    expect(container.querySelector('article')).not.toHaveClass(/cardRevealed/);
  });

  it('keeps both actions focusable while the card is unrevealed', async () => {
    renderCard();

    const edit = screen.getByRole('button', { name: 'Editar Manicure simples' });
    await userEvent.setup().tab();

    expect(edit).toHaveFocus();
  });
});
