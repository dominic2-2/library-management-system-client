export interface CoverType {
  coverTypeId: number;
  coverTypeName: string;
  bookCount?: number;
}

export type CoverTypeApiResponse = {
  $id?: string;
  coverTypeId?: number;
  coverTypeName?: string;
  bookCount?: number;
};

export type CoverTypeApiWrapper = {
  $id?: string;
  $values: CoverType[];
};

export interface CoverTypeUpdateRequest {
  coverTypeId: number;
  coverTypeName: string;
}

export interface CoverTypeCreateRequest {
  coverTypeName: string;
}
