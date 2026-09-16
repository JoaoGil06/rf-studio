import {
  DEFAULT_SCHEDULE_STATUS,
  SCHEDULE_STATUSES,
  type ScheduleStatusDescriptor,
} from '../constants/scheduleStatuses';

export function findScheduleStatus(value: string | null | undefined): ScheduleStatusDescriptor {
  return SCHEDULE_STATUSES.find((entry) => entry.value === value) ?? DEFAULT_SCHEDULE_STATUS;
}

export function findScheduleStatusBySlug(slug: string | null): ScheduleStatusDescriptor {
  return SCHEDULE_STATUSES.find((entry) => entry.slug === slug) ?? DEFAULT_SCHEDULE_STATUS;
}
