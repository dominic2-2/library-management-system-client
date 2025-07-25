export type EditionApiResponse = {
  $id?: string;
  editionId?: number;
  editionName?: string;
  bookCount?: number;
};

export type Edition = {
  editionId: number;
  editionName: string;
  bookCount: number;
};

export type EditionApiWrapper = {
  $id?: string;
  $values: EditionApiResponse[];
};

export interface EditionCreateRequest {
  editionName: string;
}

export interface EditionUpdateRequest {
  editionId: number;
  editionName: string;
}
