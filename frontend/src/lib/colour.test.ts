import { isHexColour } from './colour';

describe('isHexColour', () => {
  it.each(['#75D2D5', '#016e7c'])('accepts %s', (value) => {
    expect(isHexColour(value)).toBe(true);
  });

  it.each(['castanho médio', '#fff', '', null, undefined])('refuses %j', (value) => {
    expect(isHexColour(value)).toBe(false);
  });
});
