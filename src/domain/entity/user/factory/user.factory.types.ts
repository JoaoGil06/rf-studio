export interface CreateUserProps {
  roleId: string;
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  birthDate?: string | null;
}

export interface ReconstituteUserProps {
  id: string;
  roleId: string;
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  birthDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
