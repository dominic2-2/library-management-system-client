export interface Publisher {
  publisherId: number;
  publisherName: string;
  bookCount: number;
  address?: string;
  phone?: string;
  website?: string;
  establishedYear?: number;
}

export interface PublisherCreateRequest {
  publisherName: string;
  address?: string;
  phone?: string;
  website?: string;
  establishedYear?: number;
}

export interface PublisherUpdateRequest {
  publisherId: number;
  publisherName: string;
  address?: string;
  phone?: string;
  website?: string;
  establishedYear?: number;
}
