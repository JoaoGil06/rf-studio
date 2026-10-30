const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

/** A nail polish holds a hex; a brow product holds free text such as `castanho médio`. */
export function isHexColour(value: string | null | undefined): value is string {
  return typeof value === 'string' && HEX_COLOUR.test(value);
}
