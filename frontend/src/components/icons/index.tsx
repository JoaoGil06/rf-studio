import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

interface IconShellProps extends IconProps {
  children: ReactNode;
}

function IconShell({ className, children }: IconShellProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </IconShell>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M4.5 19.5h15M8 16.5V11M12 16.5V6.5M16 16.5v-6" />
    </IconShell>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 4a5 5 0 0 0-5 5v3.5L5.5 16h13L17 12.5V9a5 5 0 0 0-5-5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconShell>
  );
}

export function PolishIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="10" y="2.5" width="4" height="6" rx="1" />
      <path d="M14 8.5c0 1.1.5 1.6 1.4 2.2 1.3.9 2.1 1.7 2.1 3.3v4.75a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V14c0-1.6.8-2.4 2.1-3.3.9-.6 1.4-1.1 1.4-2.2" />
      <path d="M6.5 15.5h11" />
    </IconShell>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 4.5 13.6 9.4 18.5 11 13.6 12.6 12 17.5 10.4 12.6 5.5 11 10.4 9.4Z" />
    </IconShell>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 19.5c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8" />
    </IconShell>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    </IconShell>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M12 6.5v11M6.5 12h11" />
    </IconShell>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
    </IconShell>
  );
}
