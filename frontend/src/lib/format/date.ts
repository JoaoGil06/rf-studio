const MONTH_YEAR = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' });
const WEEKDAY_DAY_MONTH = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const SPOKEN = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const DAY_MONTH = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' });

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const withCapitalMonth = (formatter: Intl.DateTimeFormat, date: Date) =>
  formatter
    .formatToParts(date)
    .map((part) => (part.type === 'month' ? capitalise(part.value) : part.value))
    .join('');

export function formatMonthLabel(date: Date): string {
  const parts = MONTH_YEAR.formatToParts(date);
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const year = parts.find((part) => part.type === 'year')?.value ?? '';

  return `${capitalise(month)} ${year}`;
}

export function formatDayLabel(date: Date): string {
  return withCapitalMonth(WEEKDAY_DAY_MONTH, date);
}

export function formatSpokenDate(date: Date): string {
  return withCapitalMonth(SPOKEN, date);
}

export function formatDayMonth(date: Date, referenceYear: number): string {
  const parts = DAY_MONTH.formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = capitalise(parts.find((part) => part.type === 'month')?.value ?? '');
  const dayMonth = `${day} ${month}`;
  const year = date.getFullYear();

  return year === referenceYear ? dayMonth : `${dayMonth} ${year}`;
}

export const WEEKDAY_HEADS: readonly string[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
