import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  serviceFormDefaults,
  serviceSchema,
  type ServiceFormValues,
} from '../types/serviceForm.types';
import { ServiceForm } from './serviceForm.view';

const onValid = vi.fn();

interface HarnessProps {
  formError?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  busyLabel?: string;
}

function Harness({
  formError = null,
  isSubmitting = false,
  submitLabel = 'ADICIONAR',
  busyLabel = 'A ADICIONAR…',
}: HarnessProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onSubmit',
    defaultValues: serviceFormDefaults,
  });

  return (
    <>
      <ServiceForm
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onValid)}
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        busyLabel={busyLabel}
      />
      <button type="button" onClick={() => reset(serviceFormDefaults)}>
        limpar
      </button>
    </>
  );
}

const PRICE_LABEL = 'Preço (€)';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ServiceForm', () => {
  it('renders exactly the three fields the service needs', () => {
    render(<Harness />);

    expect(screen.getByLabelText('Nome')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(PRICE_LABEL)).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText('Duração (minutos)')).toHaveAttribute('type', 'number');
  });

  it('never puts a category control on screen — the active tab decides it', () => {
    render(<Harness />);

    expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'UNHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SOBRANCELHAS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('starts the number fields empty rather than showing NaN', () => {
    render(<Harness />);

    expect(screen.getByLabelText(PRICE_LABEL)).toHaveValue(null);
    expect(screen.getByLabelText('Duração (minutos)')).toHaveValue(null);
  });

  it('empties the number fields again after a reset, not just on first mount', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(PRICE_LABEL), '15');
    await user.type(screen.getByLabelText('Duração (minutos)'), '45');
    await user.click(screen.getByRole('button', { name: 'limpar' }));

    expect(screen.getByLabelText(PRICE_LABEL)).toHaveValue(null);
    expect(screen.getByLabelText('Duração (minutos)')).toHaveValue(null);
  });

  it('reports all three fields when submitted empty', async () => {
    render(<Harness />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(await screen.findByText('Introduza o nome.')).toBeInTheDocument();
    expect(screen.getByText('Introduza o preço.')).toBeInTheDocument();
    expect(screen.getByText('Introduza a duração.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('rejects a negative price', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Nome'), 'Manicure');
    await user.type(screen.getByLabelText(PRICE_LABEL), '-5');
    await user.type(screen.getByLabelText('Duração (minutos)'), '45');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(await screen.findByText('O preço não pode ser negativo.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('rejects a fractional duration — minutes are whole', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Nome'), 'Manicure');
    await user.type(screen.getByLabelText(PRICE_LABEL), '15');
    await user.type(screen.getByLabelText('Duração (minutos)'), '12.5');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(await screen.findByText('Use minutos inteiros.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('submits price and duration as numbers, not strings', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Nome'), 'Serviço de Teste');
    await user.type(screen.getByLabelText(PRICE_LABEL), '15');
    await user.type(screen.getByLabelText('Duração (minutos)'), '45');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    await vi.waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0]?.[0]).toEqual({
      name: 'Serviço de Teste',
      price: 15,
      durationMinutes: 45,
    });
  });

  it('wires a field error to its input via aria-describedby', async () => {
    render(<Harness />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'ADICIONAR' }));

    const input = screen.getByLabelText('Nome');
    await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Introduza o nome.')).toHaveAttribute('id', describedBy);
  });

  it('announces a form-level error', () => {
    render(<Harness formError="Já existe um serviço com este nome nesta categoria." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Já existe um serviço com este nome nesta categoria.',
    );
  });

  it('disables the submit while it is in flight', () => {
    render(<Harness isSubmitting />);

    expect(screen.getByRole('button', { name: 'A ADICIONAR…' })).toBeDisabled();
  });

  it('takes its submit label from the sheet that mounted it', () => {
    const { unmount } = render(<Harness submitLabel="GUARDAR" busyLabel="A GUARDAR…" />);

    expect(screen.getByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();

    unmount();
    render(<Harness submitLabel="GUARDAR" busyLabel="A GUARDAR…" isSubmitting />);

    expect(screen.getByRole('button', { name: 'A GUARDAR…' })).toBeDisabled();
  });

  it('gives two forms rendered side by side their own ids', () => {
    const { container } = render(
      <>
        <Harness />
        <Harness />
      </>,
    );

    const ids = Array.from(container.querySelectorAll('input')).map((input) => input.id);

    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });
});
