import { InvalidValueError } from '../../domain/@shared/errors/invalidValueError.js';

const PREFIX = 'cursor:';

export function encodeCursor(offset: number): string {
  return Buffer.from(`${PREFIX}${offset}`).toString('base64');
}

export function decodeCursor(cursor: string): number {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
  if (!decoded.startsWith(PREFIX)) {
    throw new InvalidValueError(`Invalid cursor: ${cursor}`);
  }
  const offset = Number(decoded.slice(PREFIX.length));
  if (!Number.isInteger(offset) || offset < 0) {
    throw new InvalidValueError(`Invalid cursor offset: ${cursor}`);
  }
  return offset;
}
