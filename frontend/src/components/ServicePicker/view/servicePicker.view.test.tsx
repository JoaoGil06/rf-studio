import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ServiceOption } from '../../BookingForm/types/bookingForm.types';
import type { ServicePickerProps } from '../types/servicePicker.types';
import { ServicePicker } from './servicePicker.view';

const MANICURE: ServiceOption = {
  id: 's1',
  label: 'Manicure · 15,00 €',
  durationMinutes: 30,
  price: 15,
};

const DESIGN: ServiceOption = {
  id: 's2',
  label: 'Design · 10,00 €',
  durationMinutes: 45,
  price: 10,
};

function renderPicker(overrides: Partial<ServicePickerProps> = {}) {
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  render(
    <ServicePicker
      id="services"
      label="Serviços"
      placeholder="— adicionar serviço —"
      groups={[
        { label: 'Unhas', options: [MANICURE] },
        { label: 'Sobrancelhas', options: [DESIGN] },
      ]}
      chosen={[]}
      removeVerb="Remover"
      summary={null}
      error={undefined}
      onAdd={onAdd}
      onRemove={onRemove}
      {...overrides}
    />,
  );

  return { onAdd, onRemove };
}

describe('ServicePicker', () => {
  it('reports the picked service and returns the select to its placeholder', async () => {
    const { onAdd } = renderPicker();

    await userEvent.setup().selectOptions(screen.getByLabelText('Serviços'), 's1');

    expect(onAdd).toHaveBeenCalledWith('s1');
    expect(screen.getByLabelText('Serviços')).toHaveValue('');
  });

  it('groups the options under their category headings', () => {
    renderPicker();

    expect(screen.getByRole('group', { name: 'Unhas' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Sobrancelhas' })).toBeInTheDocument();
  });

  it('lists the chosen services in the order they were added', () => {
    renderPicker({ chosen: [DESIGN, MANICURE] });

    const rows = screen.getAllByRole('listitem').map((row) => row.textContent);

    expect(rows).toEqual([DESIGN.label, MANICURE.label]);
  });

  it('names each remove button after its service', async () => {
    const { onRemove } = renderPicker({ chosen: [MANICURE, DESIGN] });

    await userEvent.setup().click(screen.getByRole('button', { name: `Remover ${DESIGN.label}` }));

    expect(onRemove).toHaveBeenCalledWith('s2');
  });

  it('shows the summary only when one is given', () => {
    renderPicker({ summary: '2 reservas · 1 h 15 · 25,00 €' });

    expect(screen.getByText('2 reservas · 1 h 15 · 25,00 €')).toBeInTheDocument();
  });

  it('leaves the summary out when there is none', () => {
    const { container } = render(
      <ServicePicker
        id="services"
        label="Serviços"
        placeholder="— adicionar serviço —"
        groups={[]}
        chosen={[MANICURE]}
        removeVerb="Remover"
        summary={null}
        error={undefined}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('ties the error to the select', () => {
    renderPicker({ error: 'Escolha pelo menos um serviço.' });

    const select = screen.getByLabelText('Serviços');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Escolha pelo menos um serviço.');
  });
});
