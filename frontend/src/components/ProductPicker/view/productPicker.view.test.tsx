import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ProductOption, ProductPickerProps } from '../types/productPicker.types';
import { ProductPicker } from './productPicker.view';

const POLISH: ProductOption = {
  id: 'p1',
  name: 'Andreia 201',
  brand: 'Andreia',
  category: 'nails',
  swatchColour: '#75D2D5',
  tone: null,
};

const BROW_TINT: ProductOption = {
  id: 'p2',
  name: 'Henna',
  brand: 'Sobrancelha Co',
  category: 'eyebrows',
  swatchColour: null,
  tone: 'castanho médio',
};

function renderPicker(overrides: Partial<ProductPickerProps> = {}) {
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  render(
    <ProductPicker
      id="products"
      label="Produtos"
      placeholder="— adicionar produto —"
      groups={[{ label: 'Andreia', options: [POLISH] }]}
      chosen={[]}
      removeVerb="Remover"
      isDisabled={false}
      error={undefined}
      onAdd={onAdd}
      onRemove={onRemove}
      {...overrides}
    />,
  );

  return { onAdd, onRemove };
}

describe('ProductPicker', () => {
  it('groups the options by brand, under the placeholder', () => {
    renderPicker();

    expect(screen.getByRole('group', { name: 'Andreia' })).toBeInTheDocument();
    expect(screen.getByLabelText('Produtos')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Andreia 201' })).toBeInTheDocument();
  });

  it('reports a choice and returns to its placeholder', async () => {
    const { onAdd } = renderPicker();

    await userEvent.setup().selectOptions(screen.getByLabelText('Produtos'), 'p1');

    expect(onAdd).toHaveBeenCalledWith('p1');
    expect(screen.getByLabelText('Produtos')).toHaveValue('');
  });

  it('names a chosen product and removes it by its id', async () => {
    const { onRemove } = renderPicker({ chosen: [POLISH] });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Remover Andreia 201' }));

    expect(onRemove).toHaveBeenCalledWith('p1');
  });

  it('draws a swatch for a polish', () => {
    renderPicker({ chosen: [POLISH] });

    expect(within(screen.getByRole('listitem')).getByTestId('swatch')).toHaveStyle({
      background: '#75D2D5',
    });
  });

  it('writes a brow product’s tone rather than drawing a swatch', () => {
    renderPicker({ chosen: [BROW_TINT] });

    expect(screen.queryByTestId('swatch')).not.toBeInTheDocument();
    expect(within(screen.getByRole('listitem')).getByText('castanho médio')).toBeInTheDocument();
  });

  it('adds the tone to an option’s name in the list', () => {
    renderPicker({ groups: [{ label: 'Sobrancelha Co', options: [BROW_TINT] }] });

    expect(screen.getByRole('option', { name: 'Henna — castanho médio' })).toBeInTheDocument();
  });

  it('ties an error to the select', () => {
    renderPicker({ error: 'Associe pelo menos 1 produto para concluir.' });

    const select = screen.getByLabelText('Produtos');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Associe pelo menos 1 produto para concluir.');
  });

  it('can be disabled while the list is loading', () => {
    renderPicker({ isDisabled: true });

    expect(screen.getByLabelText('Produtos')).toBeDisabled();
  });
});
