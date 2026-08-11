import { render, screen } from '@testing-library/react';
import { PageHeader } from './pageHeader.view';

describe('PageHeader', () => {
  it('draws the title as the page’s one h1', () => {
    render(<PageHeader whisper="gestão de" title="Produtos" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Produtos' })).toBeInTheDocument();
  });

  it('keeps the whisper out of the accessible name', () => {
    render(<PageHeader whisper="gestão de" title="Produtos" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Produtos');
    expect(screen.getByText('gestão de')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders whatever the page puts in the slot', () => {
    render(
      <PageHeader whisper="gestão de" title="Serviços">
        <button type="button">UNHAS</button>
      </PageHeader>,
    );

    expect(screen.getByRole('button', { name: 'UNHAS' })).toBeInTheDocument();
  });

  it('stands alone when there is no slot content', () => {
    render(<PageHeader whisper="as nossas" title="Clientes" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Clientes' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
