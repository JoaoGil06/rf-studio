import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTile } from './addTile.view';

describe('AddTile', () => {
  it('announces the same words it shows', () => {
    render(<AddTile label="Adicionar verniz" onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'ADICIONAR VERNIZ' })).toBeInTheDocument();
  });

  it('keeps the icon out of the accessible name', () => {
    const { container } = render(<AddTile label="Adicionar serviço" onClick={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveAccessibleName('ADICIONAR SERVIÇO');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens what it is asked to open', async () => {
    const onClick = vi.fn();
    render(<AddTile label="Adicionar verniz" onClick={onClick} />);

    await userEvent.setup().click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards a ref to the button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<AddTile label="Adicionar verniz" onClick={vi.fn()} ref={ref} />);

    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('is a button, never a submit — what it opens is the sheet, not itself', () => {
    render(<AddTile label="Adicionar verniz" onClick={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
