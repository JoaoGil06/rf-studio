export interface ScheduleNodeDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface CompleteScheduleInputDto {
  scheduleId: string;
  productIds: string[];
}

export type CompleteScheduleOutputDto = ScheduleNodeDto;
