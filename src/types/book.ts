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
export interface BookDetailDTO {
    bookId: number;
    title: string;
    description?: string;
    language?: string;
    status?: string;
    categoryName?: string;
    authors: string[];
    volumes: {
        volumeId: number;
        volumeNumber: number;
        volumeTitle?: string;
        variants: {
            variantId: number;
            publicationYear?: number;
            isbn?: string;
            price?: number;
            availableCopies: number;
        }[];
    }[];
}
