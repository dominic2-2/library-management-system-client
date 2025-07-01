export interface HomepageBookDTO {
    bookId: number;
    title: string;
    description?: string;
    language?: string;
    status?: string;
    categoryName?: string;
    authors: string[];
    totalCopies: number;
    availableCopies: number;
}