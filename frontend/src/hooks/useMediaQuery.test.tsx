import { act, render, screen } from '@testing-library/react';
import { stubMatchMedia } from '../test/matchMedia';
import { useMediaQuery } from './useMediaQuery';

const STATION = '(min-width: 621px)';

function Probe() {
  const matches = useMediaQuery(STATION);

  return <span data-testid="probe">{matches ? 'sim' : 'não'}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
  it('answers correctly on the very first render', () => {
    stubMatchMedia({ [STATION]: true });

    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('sim');
  });

  it('re-renders when the viewport crosses the query', () => {
    const media = stubMatchMedia({ [STATION]: false });

    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('não');

    act(() => media.set(STATION, true));

    expect(screen.getByTestId('probe')).toHaveTextContent('sim');
  });

  it('reads a query the test never set up as “not that composition”', () => {
    stubMatchMedia({ '(min-width: 900px)': true });

    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('não');
  });

  it('answers false where matchMedia does not exist at all', () => {
    vi.stubGlobal('matchMedia', undefined);

    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('não');
  });
});
