import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './modal.view';

function renderModal(overrides: { isOpen?: boolean; onClose?: () => void } = {}) {
  const onClose = overrides.onClose ?? vi.fn();

  const result = render(
    <div>
      <button type="button">fora</button>
      <Modal isOpen={overrides.isOpen ?? true} onClose={onClose} title="Novo verniz">
        <input aria-label="nome" />
        <button type="button">gravar</button>
      </Modal>
    </div>,
  );

  return { ...result, onClose };
}

describe('Modal', () => {
  it('renders nothing at all while closed', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('nome')).not.toBeInTheDocument();
  });

  it('names itself by its title so a screen reader announces what opened', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Novo verniz' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  it('renders its children', () => {
    renderModal();

    expect(screen.getByLabelText('nome')).toBeInTheDocument();
  });

  it('closes on the close control', async () => {
    const { onClose } = renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const { onClose } = renderModal();

    await userEvent.setup().keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on the scrim', async () => {
    const { onClose } = renderModal();

    const scrim = screen.getByRole('dialog').parentElement;
    expect(scrim).not.toBeNull();
    await userEvent.setup().click(scrim as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open when the click began inside the sheet', async () => {
    const { onClose } = renderModal();

    await userEvent.setup().click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus into the sheet when it opens', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('returns focus to whatever opened it', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <div>
        <button type="button">abrir</button>
        <Modal isOpen={false} onClose={vi.fn()} title="Novo verniz">
          <input aria-label="nome" />
        </Modal>
      </div>,
    );

    const opener = screen.getByRole('button', { name: 'abrir' });
    await user.click(opener);

    rerender(
      <div>
        <button type="button">abrir</button>
        <Modal isOpen onClose={vi.fn()} title="Novo verniz">
          <input aria-label="nome" />
        </Modal>
      </div>,
    );
    expect(opener).not.toHaveFocus();

    rerender(
      <div>
        <button type="button">abrir</button>
        <Modal isOpen={false} onClose={vi.fn()} title="Novo verniz">
          <input aria-label="nome" />
        </Modal>
      </div>,
    );

    expect(opener).toHaveFocus();
  });

  it('cycles Tab inside the sheet instead of letting it escape', async () => {
    const user = userEvent.setup();
    renderModal();

    const close = screen.getByRole('button', { name: 'Fechar' });
    const save = screen.getByRole('button', { name: 'gravar' });

    expect(close).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('nome')).toHaveFocus();
    await user.tab();
    expect(save).toHaveFocus();

    await user.tab();
    expect(close).toHaveFocus();

    await user.tab({ shift: true });
    expect(save).toHaveFocus();
  });

  it('stops the page behind it from scrolling, and gives the scroll back', () => {
    const { rerender } = renderModal();

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <div>
        <button type="button">fora</button>
        <Modal isOpen={false} onClose={vi.fn()} title="Novo verniz">
          <input aria-label="nome" />
        </Modal>
      </div>,
    );

    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
