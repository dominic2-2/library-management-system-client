export interface PaperQuality {
  paperQualityId: number;
  paperQualityName: string;
  bookCount?: number;
}

export type PaperQualityApiResponse = {
  $id?: string;
  paperQualityId?: number;
  paperQualityName?: string;
  bookCount?: number;
};

export type PaperQualityApiWrapper = {
  $id?: string;
  $values: PaperQualityApiResponse[];
};

export interface PaperQualityCreateRequest {
  paperQualityName: string;
}

export interface PaperQualityUpdateRequest {
  paperQualityId: number;
  paperQualityName: string;
}
