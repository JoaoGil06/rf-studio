import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NAV_SECTIONS } from '../../../utils/constants/navigation';
import { PATHS } from '../../../routes/paths';
import { Navbar } from './navbar.view';

const toggleThemeMock = vi.fn();
const handleSignOutMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/navbar.viewmodel', () => ({
  useNavbarViewModel: () => viewModelMock(),
}));

function renderNavbar(initialPath: string = PATHS.agenda, isDark = false) {
  viewModelMock.mockReturnValue({
    initial: 'R',
    isDark,
    themeLabel: isDark ? 'ESCURO' : 'CLARO',
    themeAria: isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro',
    toggleTheme: toggleThemeMock,
    handleSignOut: handleSignOutMock,
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Navbar', () => {
  describe('the brand lockup', () => {
    it('renders the mark and the word', () => {
      renderNavbar();

      expect(screen.getByText('RF')).toBeInTheDocument();
      expect(screen.getByText('STUDIO')).toBeInTheDocument();
    });

    it('links back to the agenda', () => {
      renderNavbar(PATHS.clients);

      expect(screen.getByText('RF').closest('a')).toHaveAttribute('href', PATHS.agenda);
    });
  });

  describe('the sections', () => {
    it('renders all six with their labels', () => {
      renderNavbar();

      const nav = screen.getByRole('navigation', { name: 'Secções' });

      expect(within(nav).getAllByRole('link')).toHaveLength(6);
      expect(within(nav).getByRole('link', { name: 'AGENDA' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'DASHBOARD' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'RESERVAS' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'PRODUTOS' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'SERVIÇOS' })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: 'CLIENTES' })).toBeInTheDocument();
    });

    it('points each link at its own path', () => {
      renderNavbar();

      const nav = screen.getByRole('navigation', { name: 'Secções' });

      for (const section of NAV_SECTIONS) {
        expect(within(nav).getByRole('link', { name: section.label })).toHaveAttribute(
          'href',
          section.path,
        );
      }
    });

    it('marks only the current section', () => {
      renderNavbar(PATHS.products);

      const nav = screen.getByRole('navigation', { name: 'Secções' });
      const current = within(nav)
        .getAllByRole('link')
        .filter((link) => link.getAttribute('aria-current') === 'page');

      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAccessibleName('PRODUTOS');
    });

    it('does not mark the agenda as current on another section', () => {
      renderNavbar(PATHS.clients);

      const nav = screen.getByRole('navigation', { name: 'Secções' });

      expect(within(nav).getByRole('link', { name: 'AGENDA' })).not.toHaveAttribute('aria-current');
      expect(within(nav).getByRole('link', { name: 'CLIENTES' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  describe('the theme control', () => {
    it('announces the destination theme in light', () => {
      renderNavbar(PATHS.agenda, false);

      expect(screen.getByRole('button', { name: 'Mudar para tema escuro' })).toBeInTheDocument();
      expect(screen.getByText('CLARO')).toBeInTheDocument();
    });

    it('announces the destination theme in dark', () => {
      renderNavbar(PATHS.agenda, true);

      expect(screen.getByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument();
      expect(screen.getByText('ESCURO')).toBeInTheDocument();
    });

    it('toggles the theme when pressed', async () => {
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole('button', { name: 'Mudar para tema escuro' }));

      expect(toggleThemeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('the utilities', () => {
    it('signs out when SAIR is pressed', async () => {
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole('button', { name: 'SAIR' }));

      expect(handleSignOutMock).toHaveBeenCalledTimes(1);
    });

    it('renders the initial as decoration, not as identity', () => {
      renderNavbar();

      const avatar = screen.getByText('R');

      expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
