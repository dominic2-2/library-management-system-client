export interface Role {
  role_id: number;
  role_name: string;
}

export interface User {
  user_id: number;
  username: string;
  password_hash: string;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  create_date: string;
  is_active: boolean;
}

export interface Author {
  author_id: number;
  author_name: string;
  bio?: string;
}

export interface Book {
  book_id: number;
  title: string;
  category_id: number;
  language?: string;
  book_status: "Active" | "Inactive" | "Deleted";
  description?: string;
}

export interface Publisher {
  publisher_id: number;
  publisher_name: string;
}

export interface Edition {
  edition_id: number;
  edition_name: string;
}

export interface PaperQuality {
  paper_quality_id: number;
  paper_quality_name: string;
}

export interface BookVolume {
  volume_id: number;
  book_id: number;
  volume_number: number;
  volume_title?: string;
  description?: string;
}

export interface BookVariant {
  variant_id: number;
  volume_id: number;
  publisher_id?: number;
  edition_id?: number;
  publication_year?: number;
  cover_type_id?: number;
  paper_quality_id?: number;
  price?: number;
  isbn?: string;
  notes?: string;
}

export interface BookCopy {
  copy_id: number;
  variant_id: number;
  barcode?: string;
  copy_status: "Available" | "Borrowed" | "Reserved" | "Lost" | "Damaged";
  location?: string;
}

export interface BookWithDetails {
  book_id: number;
  title: string;
  language?: string;
  book_status: "Active" | "Inactive" | "Deleted";
  description?: string;
  coverImg?: string;

  // Category info
  category_id: number;
  category_name: string;

  // Author info
  authors: Author[];

  // Volume info
  volumes: {
    volume_id: number;
    volume_number: number;
    volume_title?: string;
    variants: {
      variant_id: number;
      isbn?: string;
      publication_year?: number;
      price?: number;
      publisher_name?: string;
      edition_name?: string;
      cover_type_name?: string;
      paper_quality_name?: string;
      notes?: string;
    }[];
  }[];

  // Copy statistics
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  reserved_copies: number;
  damaged_copies: number;
  lost_copies: number;
}
export interface BookItem {
  bookId: number;
  title: string;
  authors: string[];
  category: string;
  language: string;
  image: string;
  available: boolean;
}

export interface BookDetailDto {
  bookId: number;
  title: string;
  description?: string;
  language?: string;
  status?: string;
  categoryName?: string;
  image?: string;
  authors: string[];
  variants: BookVariantDto[];
}

export interface BookVariantDto {
  variantId: number;
  publicationYear: number;
  isbn?: string;
  publisherName?: string;
  coverTypeName?: string;
  paperQualityName?: string;
  volumeTitle?: string;
  totalCopies: number;
  availableCopies: number;
}

// Volume request interface matching backend
export interface BookVolumeRequest {
  volumeId?: number; // Optional for new volumes, required for existing volumes during update
  volumeNumber: number;
  volumeTitle?: string;
  description?: string;
}

export interface BookCreateRequestWithFile {
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  categoryId: number;
  authorIds: number[];
  coverImage?: File;
  volumes?: BookVolumeRequest[];
}

// Add missing interfaces for consistency with Author logic
export interface BookFormData {
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  categoryId: number;
  authorIds: number[];
  volumes: BookVolumeRequest[];
}

export interface BookCreateRequest {
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  categoryId: number;
  authorIds: number[];
  coverImage?: string; // URL string for existing image
  authors?: Author[]; // For edit mode populated data
}

export interface BookUpdateRequest extends BookCreateRequest {
  book_id: number;
}

// API Response types for book details
export interface BookDetailApiVolume {
  $id: string;
  volumeId: number;
  volumeNumber: number;
  volumeTitle?: string;
  description?: string;
}

export interface BookDetailApiVariant {
  $id: string;
  variantId: number;
  publisher?: string;
  isbn?: string;
  publicationYear?: number;
  coverType?: string;
  paperQuality?: string;
  price?: number;
  location?: string;
}

export interface BookDetailApiResponse {
  $id: string;
  bookId: number;
  title: string;
  language?: string;
  bookStatus: string;
  description?: string;
  coverImg?: string;
  categoryName?: string;
  authorNames: {
    $id: string;
    $values: string[];
  };
  volumes: {
    $id: string;
    $values: BookDetailApiVolume[];
  };
  variants: {
    $id: string;
    $values: BookDetailApiVariant[];
  };
}
