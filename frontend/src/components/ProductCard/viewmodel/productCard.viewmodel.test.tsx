import { renderHook } from '@testing-library/react';
import type { ProductCardFieldsFragment } from '../../../graphql/generated/graphql';
import { AVAILABILITY_LABELS, useProductCardViewModel } from './productCard.viewmodel';

const productMock = vi.fn();

vi.mock('../model/productCard.model', () => ({
  useProductCardModel: () => ({ product: productMock() }),
}));

function aProduct(overrides: Partial<ProductCardFieldsFragment> = {}) {
  return {
    id: 'product-1',
    name: 'Nude Rosé',
    brand: 'OPI',
    category: 'nails',
    color: '#c9a08a',
    isAvailable: true,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useProductCardViewModel', () => {
  it('returns null while the fragment is missing from the cache', () => {
    productMock.mockReturnValue(null);

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current).toBeNull();
  });

  it('keeps a hex colour for the swatch', () => {
    productMock.mockReturnValue(aProduct({ color: '#C9A08A' }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.swatchColour).toBe('#C9A08A');
    expect(result.current?.swatchLabel).toBe('Cor: #C9A08A');
  });

  it('never hands a shade name to the swatch', () => {
    productMock.mockReturnValue(
      aProduct({ category: 'eyebrows', color: 'Castanho médio', name: 'Castanho médio' }),
    );

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.swatchColour).toBeNull();
    expect(result.current?.initial).toBe('C');
    expect(result.current?.swatchLabel).toBe('Cor: Castanho médio');
  });

  it('falls back to the initial tile when there is no colour at all', () => {
    productMock.mockReturnValue(aProduct({ color: null }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.swatchColour).toBeNull();
    expect(result.current?.initial).toBe('N');
    expect(result.current?.swatchLabel).toBe('Sem cor definida');
  });

  it('maps the eyebrows wire value to the SOBRANCELHAS label', () => {
    productMock.mockReturnValue(aProduct({ category: 'eyebrows' }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.metaLabel).toBe(`SOBRANCELHAS · ${AVAILABILITY_LABELS.available}`);
  });

  it('marks an unavailable product in the meta line', () => {
    productMock.mockReturnValue(aProduct({ isAvailable: false }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.metaLabel).toBe(`UNHAS · ${AVAILABILITY_LABELS.unavailable}`);
    expect(result.current?.isAvailable).toBe(false);
  });

  // A grid of 25 cards means 25 pencils and 25 crosses. Naming each one after its
  // product is what makes the row usable by voice control and by a screen reader.
  it('names each action after the product it acts on', () => {
    productMock.mockReturnValue(aProduct());

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.editLabel).toBe('Editar Nude Rosé');
    expect(result.current?.deleteLabel).toBe('Remover Nude Rosé');
  });

  it('keeps an accented name intact in both labels', () => {
    productMock.mockReturnValue(aProduct({ name: 'Café com Leite' }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.editLabel).toBe('Editar Café com Leite');
    expect(result.current?.deleteLabel).toBe('Remover Café com Leite');
  });

  it('drops an unknown category rather than rendering a stray separator', () => {
    productMock.mockReturnValue(aProduct({ category: 'lashes' }));

    const { result } = renderHook(() => useProductCardViewModel('product-1'));

    expect(result.current?.metaLabel).toBe(AVAILABILITY_LABELS.available);
  });
});
