export interface RegisterUserInputDto {
  name: string;
  email: string;
  password?: string | null;
  phoneNumber: string;
  birthDate?: string | null;
}

export interface RegisterUserOutputDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate?: string | null;
  createdAt: string;
}
