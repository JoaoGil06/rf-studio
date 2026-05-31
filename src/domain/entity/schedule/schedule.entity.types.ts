import { ScheduleStatus } from '../../@shared/value-object/schedule-status/schedule-status.vo.js';

export interface ScheduleProps {
  id: string;
  userId: string;
  serviceId: string;
  status: ScheduleStatus;
  date: Date;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateScheduleProps {
  status?: string;
  date?: Date;
  serviceId?: string;
  photoUrl?: string | null;
}
