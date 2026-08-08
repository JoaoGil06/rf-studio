import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NAV_SECTIONS } from '../../../constants/navigation';
import { PATHS } from '../../../routes/paths';
import { TabBar } from './tabBar.view';

function renderTabBar(initialPath: string = PATHS.agenda) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TabBar />
    </MemoryRouter>,
  );
}

describe('TabBar', () => {
  it('renders all six sections', () => {
    renderTabBar();

    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  it('names every section exactly as the topbar names it', () => {
    renderTabBar();

    expect(screen.getByRole('link', { name: 'AGENDA' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'DASHBOARD' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RESERVAS' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PRODUTOS' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SERVIÇOS' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CLIENTES' })).toBeInTheDocument();
  });

  /**
   * A section is named once. If the two surfaces ever drift apart, the phone and
   * the desk disagree about what one screen is called — this is the assertion
   * that catches it, rather than the labels being compared by eye.
   */
  it('carries no label the topbar does not also carry', () => {
    for (const section of NAV_SECTIONS) {
      expect(section.tabLabel).toBe(section.label);
    }
  });

  it('points each tab at its own path', () => {
    renderTabBar();

    for (const section of NAV_SECTIONS) {
      expect(screen.getByRole('link', { name: section.tabLabel })).toHaveAttribute(
        'href',
        section.path,
      );
    }
  });

  it('renders an icon beside every label', () => {
    renderTabBar();

    for (const link of screen.getAllByRole('link')) {
      expect(within(link).getByText((_, node) => node?.tagName === 'svg')).toBeInTheDocument();
    }
  });

  it('marks only the current section', () => {
    renderTabBar(PATHS.services);

    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('SERVIÇOS');
  });

  it('does not mark the agenda as current on another section', () => {
    renderTabBar(PATHS.clients);

    expect(screen.getByRole('link', { name: 'AGENDA' })).not.toHaveAttribute('aria-current');
  });
});
