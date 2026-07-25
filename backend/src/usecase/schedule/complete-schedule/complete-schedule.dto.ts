export interface ScheduleNodeDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  tip: number | null;
  createdAt: string;
}

export interface CompleteScheduleInputDto {
  scheduleId: string;
  productIds: string[];
  tip?: number | null;
}

export type CompleteScheduleOutputDto = ScheduleNodeDto;
