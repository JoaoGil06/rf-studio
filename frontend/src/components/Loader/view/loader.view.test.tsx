import { render, screen } from '@testing-library/react';
import { Loader } from './loader.view';

describe('Loader', () => {
  it('announces itself politely, without stealing focus', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveTextContent('A carregar…');
  });

  it('says what is arriving when told', () => {
    render(<Loader label="A guardar…" />);

    expect(screen.getByRole('status')).toHaveTextContent('A guardar…');
  });

  it('keeps the dots out of the accessibility tree', () => {
    const { container } = render(<Loader />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toBe('A carregar…');
  });
});
