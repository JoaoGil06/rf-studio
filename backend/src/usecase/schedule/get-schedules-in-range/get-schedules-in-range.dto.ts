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

export interface GetSchedulesInRangeFilterDto {
  userId?: string | null;
  year?: number | null;
  month?: number | null;
  weekStart?: Date | null;
  status?: string | null;
}

export interface GetSchedulesInRangeInputDto {
  filter: GetSchedulesInRangeFilterDto;
}

export type GetSchedulesInRangeOutputDto = ScheduleNodeDto[];
