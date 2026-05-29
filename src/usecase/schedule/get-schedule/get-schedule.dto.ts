export interface ScheduleNodeDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface GetScheduleInputDto {
  id: string;
}

export type GetScheduleOutputDto = ScheduleNodeDto;
