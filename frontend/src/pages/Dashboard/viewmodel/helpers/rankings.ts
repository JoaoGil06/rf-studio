import type { TopClient } from '../../../../components/TopClients/types/topClients.types';
import type { TopPolish } from '../../../../components/TopPolishes/types/topPolishes.types';
import { isHexColour } from '../../../../lib/colour';
import { formatEuros } from '../../../../lib/format/money';
import { revenueOf } from '../../../../lib/revenue';
import { DASHBOARD_COPY } from '../../../../utils/constants/dashboardMessages';
import type { CompletedRecord } from '../../types/dashboard.types';

const TOP_SIZE = 5;

const byName = (left: string, right: string) => left.localeCompare(right, 'pt-PT');

const percentOf = (value: number, highest: number) =>
  highest > 0 ? Math.round((value / highest) * 100) : 0;

export function toTopClients(rows: readonly CompletedRecord[]): TopClient[] {
  const spentBy = new Map<string, { name: string; total: number }>();

  for (const row of rows) {
    const known = spentBy.get(row.user.id);

    spentBy.set(row.user.id, {
      name: row.user.name,
      total: (known?.total ?? 0) + revenueOf(row),
    });
  }

  const ranked = [...spentBy.entries()]
    .sort(([, left], [, right]) => right.total - left.total || byName(left.name, right.name))
    .slice(0, TOP_SIZE);

  const highest = ranked[0]?.[1].total ?? 0;

  return ranked.map(([id, { name, total }], index) => ({
    id,
    rank: index + 1,
    name,
    total: formatEuros(total) ?? DASHBOARD_COPY.unknownAmount,
    barPercent: percentOf(total, highest),
  }));
}

export function toTopPolishes(rows: readonly CompletedRecord[]): TopPolish[] {
  const usage = new Map<string, { label: string; colour: string; count: number }>();

  for (const row of rows) {
    for (const product of row.products) {
      // A polish holds a hex. Bases, top coats and brow tones must not rank as colours.
      if (product.category !== 'nails' || !isHexColour(product.color)) {
        continue;
      }

      usage.set(product.id, {
        label: `${product.brand} · ${product.name}`,
        colour: product.color,
        count: (usage.get(product.id)?.count ?? 0) + 1,
      });
    }
  }

  const ranked = [...usage.entries()]
    .sort(([, left], [, right]) => right.count - left.count || byName(left.label, right.label))
    .slice(0, TOP_SIZE);

  const highest = ranked[0]?.[1].count ?? 0;

  return ranked.map(([id, { label, colour, count }]) => ({
    id,
    label,
    colour,
    count: `×${count}`,
    barPercent: percentOf(count, highest),
  }));
}
