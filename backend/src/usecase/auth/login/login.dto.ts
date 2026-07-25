export interface LoginUserInputDto {
  email: string;
  password: string;
}

export interface LoginUserOutputDto {
  token: string;
  user: {
    id: string;
    roleId: string;
    name: string;
    email: string;
    phoneNumber: string;
    birthDate: string | null;
    createdAt: string;
  };
}
