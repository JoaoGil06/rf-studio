export interface ProductNodeDto {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface GetProductsInputDto {
  first?: number | null;
  after?: string | null;
}

export interface GetProductsOutputDto {
  edges: Array<{ node: ProductNodeDto; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}
