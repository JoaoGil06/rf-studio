export interface GetUsersInputDto {
  first?: number | null;
  after?: string | null;
  role?: string | null;
}

export interface UserNodeDto {
  id: string;
  roleId: string; // internal — used by the User.role field resolver via DataLoader, not exposed in schema
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string | null;
  createdAt: string;
}

export interface GetUsersOutputDto {
  edges: Array<{ node: UserNodeDto; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}
