export interface ServiceNodeDto {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: string;
}

export interface GetServicesInputDto {
  first?: number | null;
  after?: string | null;
  category?: string | null;
}

export interface GetServicesOutputDto {
  edges: Array<{ node: ServiceNodeDto; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}
