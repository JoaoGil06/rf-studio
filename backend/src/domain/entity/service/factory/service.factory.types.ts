export interface CreateServiceProps {
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
}

export interface ReconstituteServiceProps {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
