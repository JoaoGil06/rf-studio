import { render, screen } from '@testing-library/react';
import type { ServiceCardViewModel } from '../types/serviceCard.types';
import { ServiceCard } from './serviceCard.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/serviceCard.viewmodel', () => ({
  useServiceCardViewModel: () => viewModelMock(),
}));

const PRICE = '15,00\u00A0\u20AC';

const manicure: ServiceCardViewModel = {
  name: 'Manicure simples',
  initial: 'M',
  metaLabel: 'UNHAS \u00B7 45 MIN',
  price: PRICE,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ServiceCard', () => {
  it('renders the name, the meta line and the price', () => {
    viewModelMock.mockReturnValue(manicure);

    render(<ServiceCard id="service-1" />);

    expect(screen.getByText('Manicure simples')).toBeInTheDocument();
    expect(screen.getByText(manicure.metaLabel)).toBeInTheDocument();
    expect(screen.getByText('15,00 \u20AC')).toBeInTheDocument();
  });

  it('hides the initial tile from assistive tech, since the name follows it', () => {
    viewModelMock.mockReturnValue(manicure);

    const { container } = render(<ServiceCard id="service-1" />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('M');
  });

  it('renders nothing while the fragment has not landed', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ServiceCard id="service-1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
