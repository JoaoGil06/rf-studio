export interface UserNodeDto {
  id: string;
  roleId: string; // internal — used by the User.role field resolver via DataLoader, not exposed in schema
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string | null;
  createdAt: string;
}

export interface GetUserInputDto {
  id: string;
}

export type GetUserOutputDto = UserNodeDto;
