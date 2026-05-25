export interface RegisterScheduleInputDto {
  userId: string;
  serviceId: string;
  date: Date;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  photoUrl?: string | null;
}

export interface RegisterScheduleOutputDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  createdAt: string;
}
