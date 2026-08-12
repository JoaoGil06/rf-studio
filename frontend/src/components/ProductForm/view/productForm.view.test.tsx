import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import type { ProductCategory } from '../../../utils/constants/productCategories';
import { findCategoryBySlug } from '../../../utils/helpers/productCategories';
import { productFormDefaults, type ProductFormValues } from '../types/productForm.types';
import { ProductForm } from './productForm.view';

const NAILS = findCategoryBySlug('unhas');
const EYEBROWS = findCategoryBySlug('sobrancelhas');

interface HarnessProps {
  category: ProductCategory;
  formError?: string | null;
  isSubmitting?: boolean;
  fieldError?: string;
  submitLabel?: string;
  busyLabel?: string;
}

function Harness({
  category,
  formError = null,
  isSubmitting = false,
  fieldError,
  submitLabel = 'ADICIONAR',
  busyLabel = 'A ADICIONAR…',
}: HarnessProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues: productFormDefaults(category) });

  return (
    <ProductForm
      category={category}
      register={register}
      control={control}
      errors={fieldError ? { name: { type: 'manual', message: fieldError } } : errors}
      onSubmit={(event) => event.preventDefault()}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
      busyLabel={busyLabel}
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
    const describedBy = input.getAttribute('aria-describedby');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Introduza o nome.')).toHaveAttribute('id', describedBy);
  });

  /**
   * The add sheet and the edit sheet are now separate components, so two forms can
   * be in the tree at once. With the old literal ids every label pointed at the
   * first form's fields, and the failure would have been silent.
   */
  it('gives two forms rendered side by side their own ids', () => {
    const { container } = render(
      <>
        <Harness category={NAILS} />
        <Harness category={EYEBROWS} />
      </>,
    );

    const ids = Array.from(container.querySelectorAll('input')).map((input) => input.id);

    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  it('still names every field by its own label after the ids became derived', () => {
    render(<Harness category={NAILS} />);

    expect(screen.getByLabelText('Nome')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Marca')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Cor do verniz')).toHaveAttribute('type', 'color');
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

  // The whole of the form's reuse for editing: the verb is the caller's to name.
  it('takes its submit label from the sheet that mounted it', () => {
    const { unmount } = render(
      <Harness category={NAILS} submitLabel="GUARDAR" busyLabel="A GUARDAR…" />,
    );

    expect(screen.getByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();

    unmount();
    render(
      <Harness category={NAILS} submitLabel="GUARDAR" busyLabel="A GUARDAR…" isSubmitting />,
    );

    expect(screen.getByRole('button', { name: 'A GUARDAR…' })).toBeDisabled();
  });

  it('never puts a category control on screen — the active tab decides it', () => {
    render(<Harness category={NAILS} />);

    expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'UNHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SOBRANCELHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
