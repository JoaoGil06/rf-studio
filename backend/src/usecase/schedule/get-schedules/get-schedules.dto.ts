export interface ScheduleNodeDto {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  date: string;
  photoUrl: string | null;
  tip: number | null;
  createdAt: string;
}

export interface GetSchedulesFilterDto {
  userId?: string | null;
  status?: string | null;
}

export interface GetSchedulesInputDto {
  filter?: GetSchedulesFilterDto | null;
  first?: number | null;
  after?: string | null;
}

export interface GetSchedulesOutputDto {
  edges: Array<{ node: ScheduleNodeDto; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}
