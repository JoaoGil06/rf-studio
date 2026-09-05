import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirmDialog.view';

const onConfirm = vi.fn();
const onClose = vi.fn();

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const props = {
    isOpen: true,
    title: 'Remover produto',
    name: 'Nude Rosé',
    keepLabel: 'MANTER',
    removeLabel: 'REMOVER',
    isBusy: false,
    onClose,
    onConfirm,
    ...overrides,
  };

  return render(
    <ConfirmDialog
      isOpen={props.isOpen}
      title={props.title}
      name={props.name}
      keepLabel={props.keepLabel}
      removeLabel={props.removeLabel}
      isBusy={props.isBusy}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  onConfirm.mockResolvedValue(null);
});

describe('ConfirmDialog', () => {
  it('names the subject inside the question', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Remover produto' });
    expect(dialog).toHaveTextContent('Remover Nude Rosé?');
  });

  it('offers both pills', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'MANTER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeInTheDocument();
  });

  it('never opens with focus on the destructive pill', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'REMOVER' })).not.toHaveFocus();
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('puts MANTER ahead of REMOVER in the body', () => {
    renderDialog();

    const keep = screen.getByRole('button', { name: 'MANTER' });
    const remove = screen.getByRole('button', { name: 'REMOVER' });

    expect(keep.compareDocumentPosition(remove)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('closes without confirming when MANTER is pressed', async () => {
    renderDialog();

    await userEvent.setup().click(screen.getByRole('button', { name: 'MANTER' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms and then closes when REMOVER is pressed', async () => {
    renderDialog();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open with the copy the caller mapped when the confirm failed', async () => {
    onConfirm.mockResolvedValue('Este produto já não existe.');
    renderDialog();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este produto já não existe.');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables both pills while the confirm is in flight', () => {
    renderDialog({ isBusy: true });

    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'MANTER' })).toBeDisabled();
  });

  it('carries whatever labels the caller supplies, so a second entity can reword them', () => {
    renderDialog({ title: 'Remover serviço', name: 'Manicure Russa' });

    expect(screen.getByRole('dialog', { name: 'Remover serviço' })).toHaveTextContent(
      'Remover Manicure Russa?',
    );
  });
});
