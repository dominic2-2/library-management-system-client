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

export interface Category {
  category_id: number;
  category_name: string;
  book_count: number;
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

export interface CoverType {
  cover_type_id: number;
  cover_type_name: string;
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
