export type Category = {
  categoryId: number;
  categoryName: string;
  bookCount: number;
};

export interface CategoryCreateRequest {
  categoryName: string;
}

export interface CategoryUpdateRequest {
  categoryId: number;
  categoryName: string;
}
