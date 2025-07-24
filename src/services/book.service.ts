// src/services/book.service.ts
import { ENV } from '@/config/env'
import { BookDetailDto, BookItem } from '@/types/book'

export async function getHomepageBooks(): Promise<BookItem[]> {
    const res = await fetch(`${ENV.odataUrl}/Books/books`)
    const data = await res.json()
    const rawBooks = data?.$values || []

    return rawBooks.map((b: any) => ({
        ...b,
        authors: b.authors?.$values ?? [],
    }))
}

export async function getBookDetail(bookId: number): Promise<BookDetailDto> {
    const res = await fetch(`${ENV.odataUrl}/books/${bookId}`)
    const data = await res.json()

    return {
        ...data,
        authors: data.authors?.$values ?? [],
        variants: data.variants?.$values ?? [],
    }
}

