import { render, screen } from '@testing-library/react';
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductCard', () => {
  it('renders the name, the meta line and the brand in the serif slot', () => {
    viewModelMock.mockReturnValue(paintable);

    render(<ProductCard id="product-1" />);

    expect(screen.getByText('Nude Rosé')).toBeInTheDocument();
    expect(screen.getByText('UNHAS · DISPONÍVEL')).toBeInTheDocument();
    expect(screen.getByText('OPI')).toBeInTheDocument();
  });

  it('hides the swatch from assistive tech and states the colour in text instead', () => {
    viewModelMock.mockReturnValue(paintable);

    const { container } = render(<ProductCard id="product-1" />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getByText('Cor: #c9a08a')).toBeInTheDocument();
  });

  it('shows the initial when there is no paintable colour', () => {
    viewModelMock.mockReturnValue({
      ...paintable,
      swatchColour: null,
      swatchLabel: 'Sem cor definida',
    });

    render(<ProductCard id="product-1" />);

    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('Sem cor definida')).toBeInTheDocument();
  });

  it('lays a veil over the card when the product is unavailable', () => {
    viewModelMock.mockReturnValue({
      ...paintable,
      isAvailable: false,
      metaLabel: 'UNHAS · INDISPONÍVEL',
    });

    const { container } = render(<ProductCard id="product-1" />);

    expect(container.querySelector('article > span:last-child')).toHaveClass(/veil/);
  });

  it('leaves an available card unveiled', () => {
    viewModelMock.mockReturnValue(paintable);

    const { container } = render(<ProductCard id="product-1" />);

    expect(container.querySelector('article > span:last-child')).toBeNull();
  });

  it('renders nothing when the fragment is missing from the cache', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ProductCard id="product-1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
