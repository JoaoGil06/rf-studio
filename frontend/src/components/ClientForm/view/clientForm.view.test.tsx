import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { clientFormDefaults, clientSchema, type ClientFormValues } from '../types/clientForm.types';
import { ClientForm } from './clientForm.view';

const onValid = vi.fn();

interface HarnessProps {
  formError?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  busyLabel?: string;
  layout?: 'bar' | 'stacked';
}

function Harness({
  formError = null,
  isSubmitting = false,
  submitLabel = 'ADICIONAR',
  busyLabel = 'A ADICIONAR…',
  layout = 'bar',
}: HarnessProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onSubmit',
    defaultValues: clientFormDefaults,
  });

  return (
    <>
      <ClientForm
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onValid)}
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        busyLabel={busyLabel}
        layout={layout}
      />
      <button type="button" onClick={() => reset(clientFormDefaults)}>
        limpar
      </button>
    </>
  );
}

const NAME_LABEL = 'Nome da cliente';

async function submitForm() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ClientForm — the three fields the bar carries', () => {
  it('renders nome, email and telemóvel, each reachable by its label', () => {
    render(<Harness />);

    expect(screen.getByLabelText(NAME_LABEL)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Telemóvel')).toHaveAttribute('type', 'tel');
  });

  it('asks for no date of birth and no password', () => {
    render(<Harness />);

    expect(screen.queryByLabelText(/nascimento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/palavra-passe|password/i)).not.toBeInTheDocument();
  });

  it('lets the device complete a name, an email and a number', () => {
    render(<Harness />);

    expect(screen.getByLabelText(NAME_LABEL)).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Telemóvel')).toHaveAttribute('autocomplete', 'tel');
  });

  it('starts every field empty', () => {
    render(<Harness />);

    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Telemóvel')).toHaveValue('');
  });
});

describe('ClientForm — validation reaches the right field', () => {
  it('wires an empty nome to its own message through aria-describedby', async () => {
    render(<Harness />);

    await submitForm();

    const field = screen.getByLabelText(NAME_LABEL);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Introduza o nome.')).toHaveAttribute(
      'id',
      field.getAttribute('aria-describedby'),
    );
    expect(onValid).not.toHaveBeenCalled();
  });

  it('wires a malformed email to its own message', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Email'), 'nao-e-um-email');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    const field = screen.getByLabelText('Email');
    expect(screen.getByText('Introduza um email válido.')).toHaveAttribute(
      'id',
      field.getAttribute('aria-describedby'),
    );
  });

  it('wires a too-short telemóvel to its own message', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Telemóvel'), '91234');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    const field = screen.getByLabelText('Telemóvel');
    expect(screen.getByText('Introduza um número com pelo menos 9 dígitos.')).toHaveAttribute(
      'id',
      field.getAttribute('aria-describedby'),
    );
  });

  it('describes nothing while a field is still valid', () => {
    render(<Harness />);

    expect(screen.getByLabelText(NAME_LABEL)).not.toHaveAttribute('aria-describedby');
    expect(screen.getByLabelText(NAME_LABEL)).not.toHaveAttribute('aria-invalid');
  });

  it('submits the trimmed values once all three are valid', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(NAME_LABEL), '  Maria Silva  ');
    await user.type(screen.getByLabelText('Email'), 'maria@exemplo.pt');
    await user.type(screen.getByLabelText('Telemóvel'), '912345678');
    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(onValid).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Maria Silva',
        email: 'maria@exemplo.pt',
        phoneNumber: '912345678',
      }),
      expect.anything(),
    );
  });
});

describe('ClientForm — the submit button', () => {
  it('announces a form-level failure to assistive tech', () => {
    render(<Harness formError="Já existe uma cliente com este email." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma cliente com este email.');
  });

  it('shows the busy label and locks out a second press while submitting', () => {
    render(<Harness isSubmitting />);

    expect(screen.getByRole('button', { name: 'A ADICIONAR…' })).toBeDisabled();
  });

  it('shows the idle label and accepts a press while not submitting', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'ADICIONAR' })).toBeEnabled();
  });
});

describe('ClientForm — the stacked layout the edit sheet hosts', () => {
  it('drops the panel chrome when hosted inside a modal', () => {
    const { container } = render(<Harness layout="stacked" />);

    expect(container.querySelector('form')?.className).toContain('formPlain');
  });

  it('keeps the panel chrome when it is the inline add bar', () => {
    const { container } = render(<Harness layout="bar" />);

    expect(container.querySelector('form')?.className).not.toContain('formPlain');
  });

  it('carries the same three fields and the same submit in either layout', () => {
    render(<Harness layout="stacked" submitLabel="GUARDAR" busyLabel="A GUARDAR…" />);

    expect(screen.getByLabelText(NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telemóvel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();
  });

  it('still validates the same way inside the sheet', async () => {
    const user = userEvent.setup();
    render(<Harness layout="stacked" submitLabel="GUARDAR" />);

    await user.click(screen.getByRole('button', { name: 'GUARDAR' }));

    expect(screen.getByText('Introduza o nome.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });
});
