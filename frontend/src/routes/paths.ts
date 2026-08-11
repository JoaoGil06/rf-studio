export const PATHS = {
  login: '/login',
  agenda: '/',
  dashboard: '/dashboard',
  schedules: '/schedules',
  products: '/products',
  services: '/services',
  clients: '/clients',
} as const;

export const DEFAULT_SIGNED_IN_PATH: string = PATHS.agenda;
