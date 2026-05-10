// White list para aquilo que pode ser feito por utilizadores sem login
export const PUBLIC_OPERATIONS: ReadonlySet<string> = new Set([
  'login',
  'registerUser',
  '__schema',
  '__type',
  '__typename',
]);
