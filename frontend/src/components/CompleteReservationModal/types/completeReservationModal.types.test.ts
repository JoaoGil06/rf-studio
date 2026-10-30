import { completeReservationSchema, parseTip } from './completeReservationModal.types';

const valid = { productIds: ['p1'], tip: null };

describe('completeReservationSchema', () => {
  it('refuses no products, in the prototype’s words', () => {
    const result = completeReservationSchema.safeParse({ ...valid, productIds: [] });

    expect(result.error?.issues[0]?.message).toBe('Associe pelo menos 1 produto para concluir.');
  });

  it.each([null, 0, 5.55, 0.07, 9999.99])('accepts a tip of %j', (tip) => {
    expect(completeReservationSchema.safeParse({ ...valid, tip }).success).toBe(true);
  });

  it.each([-1, 10000, 5.555, Number.NaN])('refuses a tip of %j', (tip) => {
    expect(completeReservationSchema.safeParse({ ...valid, tip }).success).toBe(false);
  });
});

describe('parseTip', () => {
  it.each(['', null, undefined])('reads %j as no tip', (raw) => {
    expect(parseTip(raw)).toBeNull();
  });

  it('reads a typed amount as a number', () => {
    expect(parseTip('5.5')).toBe(5.5);
  });
});
