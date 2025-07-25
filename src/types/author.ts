export type AuthorApiResponse = {
  $id?: string;
  authorId?: number;
  authorName?: string;
  authorBio?: string;
  nationality?: string;
  genre?: string;
  photoUrl?: string;
  bookCount?: number;
};

export type Author = {
  authorId: number;
  authorName: string;
  authorBio: string;
  nationality: string;
  genre: string;
  photoUrl: string;
  bookCount: number;
};

export type AuthorApiWrapper = {
  $id?: string;
  $values: AuthorApiResponse[];
};

export interface AuthorCreateRequest {
  authorName: string;
  authorBio: string;
  nationality: string;
  genre: string;
  photoUrl: string;
}

export interface AuthorUpdateRequest {
  authorId: number;
  authorName: string;
  authorBio: string;
  nationality: string;
  genre: string;
  photoUrl: string;
}

// New interfaces for file upload support
export interface AuthorCreateRequestWithFile {
  authorName: string;
  authorBio: string;
  nationality?: string;
  genre?: string;
  photo?: File;
}

export interface AuthorUpdateRequestWithFile {
  authorId: number;
  authorName: string;
  authorBio: string;
  nationality?: string;
  genre?: string;
  photo?: File;
}
