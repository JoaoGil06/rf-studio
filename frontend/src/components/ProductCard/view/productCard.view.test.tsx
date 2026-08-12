import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ProductCardViewModel } from '../types/productCard.types';
import { ProductCard } from './productCard.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/productCard.viewmodel', () => ({
  useProductCardViewModel: () => viewModelMock(),
}));

const paintable: ProductCardViewModel = {
  name: 'Nude Rosé',
  brand: 'OPI',
  swatchColour: '#c9a08a',
  initial: 'N',
  metaLabel: 'UNHAS · DISPONÍVEL',
  isAvailable: true,
  swatchLabel: 'Cor: #c9a08a',
  editLabel: 'Editar Nude Rosé',
  deleteLabel: 'Remover Nude Rosé',
};

const onEdit = vi.fn();
const onDelete = vi.fn();

function renderCard() {
  return render(<ProductCard id="product-1" onEdit={onEdit} onDelete={onDelete} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductCard', () => {
  it('renders the name, the meta line and the brand in the serif slot', () => {
    viewModelMock.mockReturnValue(paintable);

    renderCard();

    expect(screen.getByText('Nude Rosé')).toBeInTheDocument();
    expect(screen.getByText('UNHAS · DISPONÍVEL')).toBeInTheDocument();
    expect(screen.getByText('OPI')).toBeInTheDocument();
  });

  it('hides the swatch from assistive tech and states the colour in text instead', () => {
    viewModelMock.mockReturnValue(paintable);

    const { container } = renderCard();

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getByText('Cor: #c9a08a')).toBeInTheDocument();
  });

  it('shows the initial when there is no paintable colour', () => {
    viewModelMock.mockReturnValue({
      ...paintable,
      swatchColour: null,
      swatchLabel: 'Sem cor definida',
    });

    renderCard();

    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('Sem cor definida')).toBeInTheDocument();
  });

  it('lays a veil over the card when the product is unavailable', () => {
    viewModelMock.mockReturnValue({
      ...paintable,
      isAvailable: false,
      metaLabel: 'UNHAS · INDISPONÍVEL',
    });

    const { container } = renderCard();

    expect(container.querySelector('article > span:last-child')).toHaveClass(/veil/);
  });

  it('leaves an available card unveiled', () => {
    viewModelMock.mockReturnValue(paintable);

    const { container } = renderCard();

    expect(container.querySelector('article > span:last-child')).toBeNull();
  });

  it('renders nothing when the fragment is missing from the cache', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = renderCard();

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProductCard — the reveal layer', () => {
  beforeEach(() => {
    viewModelMock.mockReturnValue(paintable);
  });

  it('carries both actions, each named after the product', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Editar Nude Rosé' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Nude Rosé' })).toBeInTheDocument();
  });

  it('reports this card’s id when the pencil is pressed, and nothing else', async () => {
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Editar Nude Rosé' }));

    expect(onEdit).toHaveBeenCalledWith('product-1');
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('reports this card’s id when the cross is pressed', async () => {
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Remover Nude Rosé' }));

    expect(onDelete).toHaveBeenCalledWith('product-1');
    expect(onEdit).not.toHaveBeenCalled();
  });

  // Touch has no hover, so a tap on the card body is the third way in.
  it('toggles the revealed class on a tap, and off again on the next one', async () => {
    const user = userEvent.setup();
    const { container } = renderCard();

    const card = container.querySelector('article');
    expect(card).not.toHaveClass(/cardRevealed/);

    await user.click(screen.getByText('Nude Rosé'));
    expect(card).toHaveClass(/cardRevealed/);

    await user.click(screen.getByText('Nude Rosé'));
    expect(card).not.toHaveClass(/cardRevealed/);
  });

  // Without stopPropagation, pressing an action would also fire the card's toggle,
  // so the row would flicker shut underneath the finger that just used it.
  it('does not toggle the card when an action is pressed', async () => {
    const { container } = renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Editar Nude Rosé' }));

    expect(container.querySelector('article')).not.toHaveClass(/cardRevealed/);
  });

  /**
   * The buttons are only transparent, never unmounted. Three things depend on it:
   * keyboard users can reach them at all, Modal's focus restore has something to
   * return to, and the row re-reveals by itself when focus lands back on it.
   */
  it('keeps both actions focusable while the card is unrevealed', async () => {
    renderCard();

    const edit = screen.getByRole('button', { name: 'Editar Nude Rosé' });
    await userEvent.setup().tab();

    expect(edit).toHaveFocus();
  });
});
