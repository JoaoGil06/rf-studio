export interface ScheduleNodeDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface UpdateScheduleInputDto {
  id: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  date?: Date;
  serviceId?: string;
}

export type UpdateScheduleOutputDto = ScheduleNodeDto;
