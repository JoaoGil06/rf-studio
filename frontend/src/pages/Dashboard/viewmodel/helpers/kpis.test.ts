import { DASHBOARD_COPY } from '../../../../utils/constants/dashboardMessages';
import { toDashboardKpis } from './kpis';

const normalise = (value: string | undefined) => value?.replaceAll(' ', ' ');

function kpisOf(completed: { finalPrice: number; tip?: number | null }[], pendingCount = 0) {
  const kpis = toDashboardKpis({ completed, pendingCount, monthName: 'Outubro' });

  return Object.fromEntries(kpis.map((kpi) => [kpi.key, kpi]));
}

describe('toDashboardKpis', () => {
  it('names the month in the revenue label', () => {
    expect(kpisOf([]).revenue?.label).toBe('RECEITA · OUTUBRO');
  });

  it('includes tips in the revenue', () => {
    const { revenue } = kpisOf([{ finalPrice: 30, tip: 5 }, { finalPrice: 20 }]);

    expect(normalise(revenue?.value)).toBe('55,00 €');
  });

  it('counts the completed and pending reservations', () => {
    const { completed, pending } = kpisOf([{ finalPrice: 30 }, { finalPrice: 20 }], 3);

    expect(completed?.value).toBe('2');
    expect(pending?.value).toBe('3');
  });

  it('averages the revenue per completed reservation', () => {
    const { average } = kpisOf([{ finalPrice: 30, tip: 10 }, { finalPrice: 20 }]);

    expect(normalise(average?.value)).toBe('30,00 €');
    expect(average?.label).toBe('MÉDIA POR SERVIÇO');
  });

  it('shows an empty month as zero revenue and no average, never NaN', () => {
    const { revenue, average } = kpisOf([]);

    expect(normalise(revenue?.value)).toBe('0,00 €');
    expect(average?.value).toBe(DASHBOARD_COPY.unknownAmount);
  });

  it('keeps the prototype order', () => {
    const kpis = toDashboardKpis({ completed: [], pendingCount: 0, monthName: 'Outubro' });

    expect(kpis.map((kpi) => kpi.key)).toEqual(['revenue', 'completed', 'pending', 'average']);
  });
});
