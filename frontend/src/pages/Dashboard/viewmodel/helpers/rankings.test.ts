import type { CompletedRecord, ProductRecord } from '../../types/dashboard.types';
import { toTopClients, toTopPolishes } from './rankings';

const normalise = (value: string | undefined) => value?.replaceAll(' ', ' ');

function aRow(
  clientId: string,
  clientName: string,
  finalPrice: number,
  products: ProductRecord[] = [],
  tip: number | null = null,
): CompletedRecord {
  return {
    id: `${clientId}-${finalPrice}`,
    finalPrice,
    tip,
    user: { id: clientId, name: clientName },
    service: { id: 'service-1', category: 'nails' },
    products,
  };
}

function aPolish(id: string, overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id,
    name: `Polish ${id}`,
    brand: 'Andreia',
    category: 'nails',
    color: '#75D2D5',
    ...overrides,
  };
}

describe('toTopClients', () => {
  it('adds up two reservations from one client, tips included', () => {
    const [top] = toTopClients([aRow('a', 'Ana', 30, [], 5), aRow('a', 'Ana', 20)]);

    expect(normalise(top?.total)).toBe('55,00 €');
  });

  it('ranks by spend, highest first', () => {
    const clients = toTopClients([aRow('a', 'Ana', 10), aRow('b', 'Bia', 40)]);

    expect(clients.map((client) => [client.rank, client.name])).toEqual([
      [1, 'Bia'],
      [2, 'Ana'],
    ]);
  });

  it('keeps five', () => {
    const rows = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, index) => aRow(id, id, 60 - index));

    expect(toTopClients(rows).map((client) => client.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('breaks a tie by name', () => {
    const clients = toTopClients([aRow('z', 'Zita', 10), aRow('a', 'Ana', 10)]);

    expect(clients.map((client) => client.name)).toEqual(['Ana', 'Zita']);
  });

  it('scales the bars to the top client', () => {
    const clients = toTopClients([aRow('a', 'Ana', 40), aRow('b', 'Bia', 10)]);

    expect(clients.map((client) => client.barPercent)).toEqual([100, 25]);
  });

  it('is empty for no rows', () => {
    expect(toTopClients([])).toEqual([]);
  });
});

describe('toTopPolishes', () => {
  it('counts each use across reservations', () => {
    const [top] = toTopPolishes([
      aRow('a', 'Ana', 10, [aPolish('p1')]),
      aRow('b', 'Bia', 10, [aPolish('p1')]),
    ]);

    expect(top?.count).toBe('×2');
  });

  it('names the brand, because two brands can share a polish name', () => {
    const [top] = toTopPolishes([aRow('a', 'Ana', 10, [aPolish('p1', { name: 'Rouge' })])]);

    expect(top?.label).toBe('Andreia · Rouge');
  });

  it('carries the polish colour', () => {
    const [top] = toTopPolishes([aRow('a', 'Ana', 10, [aPolish('p1', { color: '#112233' })])]);

    expect(top?.colour).toBe('#112233');
  });

  it('does not rank a brow product, even one holding a colour word', () => {
    const brow = aPolish('b1', { category: 'eyebrows', color: 'castanho médio' });

    expect(toTopPolishes([aRow('a', 'Ana', 10, [brow])])).toEqual([]);
  });

  it('does not rank a nail product with no colour', () => {
    const topCoat = aPolish('t1', { color: null });

    expect(toTopPolishes([aRow('a', 'Ana', 10, [topCoat])])).toEqual([]);
  });

  it('ranks by use, breaks a tie by label, and keeps five', () => {
    const products = ['c', 'b', 'a', 'd', 'e', 'f'].map((id) => aPolish(id));
    const repeated = aPolish('f');

    const polishes = toTopPolishes([aRow('a', 'Ana', 10, [...products, repeated])]);

    expect(polishes.map((polish) => polish.id)).toEqual(['f', 'a', 'b', 'c', 'd']);
  });

  it('scales the bars to the most used polish', () => {
    const polishes = toTopPolishes([
      aRow('a', 'Ana', 10, [aPolish('p1'), aPolish('p2')]),
      aRow('b', 'Bia', 10, [aPolish('p1')]),
    ]);

    expect(polishes.map((polish) => polish.barPercent)).toEqual([100, 50]);
  });

  it('is empty for no rows', () => {
    expect(toTopPolishes([])).toEqual([]);
  });
});
