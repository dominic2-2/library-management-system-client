export interface BookItem {
    bookId: number
    title: string
    authors: string[]
    category: string
    language: string
    image: string
    available: boolean
}

export interface BookDetailDto {
    bookId: number
    title: string
    description?: string
    language?: string
    status?: string
    categoryName?: string
    image?: string
    authors: string[]
    variants: BookVariantDto[]
}

export interface BookVariantDto {
    variantId: number
    publicationYear: number
    isbn?: string
    publisherName?: string
    coverTypeName?: string
    paperQualityName?: string
    volumeTitle?: string
    totalCopies: number
    availableCopies: number
}