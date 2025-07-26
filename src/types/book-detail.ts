export interface BookCopy {
  copyId: number;
  barcode: string;
  copyStatus: string;
  location: string;
}

interface CopiesWrapper {
  $values: BookCopy[];
}

export interface BookVariant {
  variantId: number;
  publicationYear: number;
  isbn: string;
  editionName: string;
  publisherName: string;
  coverTypeName: string;
  paperQualityName: string;
  copies: CopiesWrapper;
}

interface VariantsWrapper {
  $values: BookVariant[];
}

export interface BookVolume {
  volumeId: number;
  volumeNumber: number;
  volumeTitle: string;
  description: string | null;
  variants: VariantsWrapper;
}

interface AuthorsWrapper {
  $values: string[];
}

interface VolumesWrapper {
  $values: BookVolume[];
}

export interface BookDetailResponse {
  bookId: number;
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  coverImg: string;
  categoryName: string;
  authors: AuthorsWrapper;
  volumes: VolumesWrapper;
}
