export interface CreateScheduleProps {
  userId: string;
  serviceId: string;
  date: Date;
  status?: string;
  photoUrl?: string | null;
}

export interface ReconstituteScheduleProps {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: Date;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
