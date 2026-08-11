import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import type { ProductCategory } from '../../../utils/constants/productCategories';
import { findCategoryBySlug } from '../../../utils/helpers/productCategories';
import { PRODUCT_FORM_DEFAULTS, type ProductFormValues } from '../types/productForm.types';
import { ProductForm } from './productForm.view';

const NAILS = findCategoryBySlug('unhas');
const EYEBROWS = findCategoryBySlug('sobrancelhas');

interface HarnessProps {
  category: ProductCategory;
  formError?: string | null;
  isSubmitting?: boolean;
  fieldError?: string;
}

function Harness({ category, formError = null, isSubmitting = false, fieldError }: HarnessProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues: PRODUCT_FORM_DEFAULTS });

  return (
    <ProductForm
      category={category}
      register={register}
      control={control}
      errors={fieldError ? { name: { type: 'manual', message: fieldError } } : errors}
      onSubmit={(event) => event.preventDefault()}
      formError={formError}
      isSubmitting={isSubmitting}
    />
  );
}

describe('ProductForm', () => {
  it('renders name, marca and the availability pill for both categories', () => {
    const { unmount } = render(<Harness category={NAILS} />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DISPONÍVEL' })).toBeInTheDocument();

    unmount();
    render(<Harness category={EYEBROWS} />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DISPONÍVEL' })).toBeInTheDocument();
  });

  it('gives nails a colour well and brows a text field', () => {
    const { unmount } = render(<Harness category={NAILS} />);

    expect(screen.getByLabelText('Cor do verniz')).toHaveAttribute('type', 'color');

    unmount();
    render(<Harness category={EYEBROWS} />);

    const tom = screen.getByLabelText('Tom');
    expect(tom).toHaveAttribute('type', 'text');
    expect(tom).toHaveAttribute('placeholder', 'Ex.: castanho médio');
  });

  it('toggles the availability pill without leaving the form', async () => {
    render(<Harness category={NAILS} />);

    const pill = screen.getByRole('button', { name: 'DISPONÍVEL' });
    expect(pill).toHaveAttribute('aria-pressed', 'true');

    await userEvent.setup().click(pill);

    const toggled = screen.getByRole('button', { name: 'INDISPONÍVEL' });
    expect(toggled).toHaveAttribute('aria-pressed', 'false');
  });

  it('wires a field error to its input via aria-describedby', () => {
    render(<Harness category={NAILS} fieldError="Introduza o nome." />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'product-name-error');
    expect(screen.getByText('Introduza o nome.')).toHaveAttribute('id', 'product-name-error');
  });

  it('announces a form-level error', () => {
    render(
      <Harness category={NAILS} formError="Já existe um produto com este nome e esta marca." />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Já existe um produto com este nome e esta marca.',
    );
  });

  it('disables the submit while it is in flight', () => {
    render(<Harness category={NAILS} isSubmitting />);

    expect(screen.getByRole('button', { name: 'A ADICIONAR…' })).toBeDisabled();
  });

  it('never puts a category control on screen — the active tab decides it', () => {
    render(<Harness category={NAILS} />);

    expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'UNHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SOBRANCELHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
