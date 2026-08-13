import type { CategoryDescriptor } from './categories';

export type ServiceCategory = CategoryDescriptor;

const NAILS: ServiceCategory = {
  value: 'nails',
  slug: 'unhas',
  label: 'UNHAS',
  noun: 'serviço',
};

const EYEBROWS: ServiceCategory = {
  value: 'eyebrows',
  slug: 'sobrancelhas',
  label: 'SOBRANCELHAS',
  noun: 'serviço',
};

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [NAILS, EYEBROWS];

export const DEFAULT_SERVICE_CATEGORY: ServiceCategory = NAILS;
