export interface BookCopy {
  $id: string;
  copyId: number;
  barcode: string;
  copyStatus: string; // "Available", "Borrowed", "Reserved", "Lost", "Damaged"
  location: string;
  variantId: number;
  publicationYear: number;
  isbn: string;
  coverTypeName: string;
  publisherName: string;
  editionName: string;
  paperQualityName: string;
  bookTitle: string;
  categoryName: string;
  volumn: number; // Tập số
  authorNames: {
    $id: string;
    $values: string[];
  };
}

export interface BookCopyResponse {
  $id: string;
  totalCount: number;
  items: {
    $id: string;
    $values: BookCopy[];
  };
}

export interface BookCopyFilter {
  search?: string; // Book title + ISBN
  copyStatus?: string;
  categoryName?: string;
  authorName?: string;
  publisherName?: string;
  editionName?: string;
  coverTypeName?: string;
  paperQualityName?: string;
  publicationYear?: number;
  floor?: number; // Tầng
  shelf?: number; // Kệ
}

// Dropdown option interface
export interface DropdownOption {
  value: string;
  label: string;
}

// Book volume selection for copy creation
export interface BookVolumeForCopy {
  volumeId: number;
  volumeNumber: number;
  title: string;
  author?: string;
  coverImg?: string;
}

// Create book copy request
export interface CreateBookCopyRequest {
  volumeId: number;
  publisherId?: number;
  editionId?: number;
  publicationYear?: number;
  coverTypeId?: number;
  paperQualityId?: number;
  notes?: string;
  copyStatus?: string;
  location?: string;
}

export interface BookCopyListParams {
  $top?: number;
  $skip?: number;
  $filter?: string;
  $orderby?: string;
  $count?: boolean;
}

// Update book copy request - only editable fields
export interface UpdateBookCopyRequest {
  coverTypeId?: number;
  paperQualityId?: number;
  editionId?: number;
  location?: string;
  copyStatus?: string;
}

// Dropdown option with ID
export interface DropdownOptionWithId {
  id: number;
  value: string;
  label: string;
}
