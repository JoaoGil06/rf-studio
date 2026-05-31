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
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date?: Date;
  serviceId?: string;
  photoUrl?: string | null;
}

export type UpdateScheduleOutputDto = ScheduleNodeDto;
