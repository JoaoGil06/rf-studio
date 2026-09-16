import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PRODUCT_CATEGORIES } from '../../../utils/constants/productCategories';
import { CategoryTabs } from './categoryTabs.view';

const GROUP_LABEL = 'Categoria de produtos';

function renderTabs(activeSlug: string, onSelect = vi.fn()) {
  render(
    <CategoryTabs
      categories={PRODUCT_CATEGORIES}
      activeSlug={activeSlug}
      onSelect={onSelect}
      label={GROUP_LABEL}
    />,
  );

  return onSelect;
}

describe('CategoryTabs', () => {
  it('renders one tab per category', () => {
    renderTabs('unhas');

    expect(screen.getByRole('button', { name: 'UNHAS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SOBRANCELHAS' })).toBeInTheDocument();
  });

  it('presses only the active tab', () => {
    renderTabs('sobrancelhas');

    expect(screen.getByRole('button', { name: 'SOBRANCELHAS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'UNHAS' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('hands the whole category object to onSelect', async () => {
    const onSelect = renderTabs('unhas');

    await userEvent.setup().click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'eyebrows', slug: 'sobrancelhas' }),
    );
  });

  it('names the group for a screen reader', () => {
    renderTabs('unhas');

    expect(screen.getByRole('group', { name: GROUP_LABEL })).toBeInTheDocument();
  });
});

describe('CategoryTabs — any { slug, label } descriptor', () => {
  const PENDING_TAB = { slug: 'pendentes', label: 'PENDENTES' };
  const CANCELLED_TAB = { slug: 'canceladas', label: 'CANCELADAS' };

  it('hands back the caller’s own object, not a copy', async () => {
    const onSelect = vi.fn();
    render(
      <CategoryTabs
        categories={[PENDING_TAB, CANCELLED_TAB]}
        activeSlug="pendentes"
        onSelect={onSelect}
        label="Estado das reservas"
      />,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'CANCELADAS' }));

    expect(onSelect.mock.calls[0]?.[0]).toBe(CANCELLED_TAB);
  });
});
