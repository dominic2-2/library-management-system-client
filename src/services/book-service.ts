import { BookWithDetails, BookCreateRequestWithFile, BookDetailApiResponse } from "@/types/book";
import { ENV } from "@/config/env";

// Types for the API response structure
interface ApiBookResponse {
  $values: ApiBook[];
}

interface ApiBook {
  bookId: number;
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  author: string;
  volumn: string;
  availability: string;
  coverImg: string;
}

// OData response structure
interface ODataResponse<T> {
  "@odata.context"?: string;
  "@odata.count"?: number;
  value: T[];
}

// OData query builder helper
const buildODataQuery = (params: {
  $select?: string[];
  $expand?: string[];
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $skip?: number;
  $search?: string;
  $count?: boolean;
}): string => {
  const queryParams: string[] = [];

  if (params.$select && params.$select.length > 0) {
    queryParams.push(`$select=${params.$select.join(",")}`);
  }

  if (params.$expand && params.$expand.length > 0) {
    queryParams.push(`$expand=${params.$expand.join(",")}`);
  }

  if (params.$filter) {
    queryParams.push(`$filter=${encodeURIComponent(params.$filter)}`);
  }

  if (params.$orderby) {
    queryParams.push(`$orderby=${params.$orderby}`);
  }

  if (params.$top) {
    queryParams.push(`$top=${params.$top}`);
  }

  if (params.$skip) {
    queryParams.push(`$skip=${params.$skip}`);
  }

  if (params.$search) {
    queryParams.push(`$search=${encodeURIComponent(params.$search)}`);
  }

  if (params.$count) {
    queryParams.push(`$count=true`);
  }

  return queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
};

// Base API URL for books
const BOOKS_API_BASE = `${ENV.apiUrl}/manage/Book`;

// HTTP request helper
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();   
  return data;
};

// Fetch all books with OData support
export const fetchBooks = async (
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryFilter?: string;
    statusFilter?: string;
    orderBy?: string;
  } = {}
): Promise<{ books: BookWithDetails[]; totalCount: number }> => {
  const {
    page = 0,
    pageSize = 10,
    search,
    categoryFilter,
    statusFilter,
    orderBy = "title",
  } = options;

  const filters: string[] = [];

  // Add search filter
  if (search) {
    filters.push(
      `contains(tolower(title), tolower('${search}')) or contains(tolower(author), tolower('${search}')) or contains(tolower(description), tolower('${search}'))`
    );
  }

  // Add category filter
  if (categoryFilter) {
    filters.push(`category_name eq '${categoryFilter}'`);
  }

  // Add status filter
  if (statusFilter) {
    filters.push(`book_status eq '${statusFilter}'`);
  }

  const query = buildODataQuery({
    $filter: filters.length > 0 ? filters.join(" and ") : undefined,
    $orderby: orderBy,
    $top: pageSize,
    $skip: page * pageSize,
  });

  try {
    const response = await apiRequest<ODataResponse<ApiBook> | ApiBookResponse>(
      `${BOOKS_API_BASE}${query}`
    );

    // Handle OData response format
    let booksData: ApiBook[];
    if ("value" in response && response.value) {
      // New OData format
      booksData = response.value;
    } else if ("$values" in response && response.$values) {
      // Old format (fallback)
      booksData = response.$values;
    } else {
      // Direct array (fallback)
      booksData = Array.isArray(response) ? response : [];
    } 

    // Transform the data to match our expected structure
    const transformedBooks = booksData.map((book: ApiBook) => {
      // Parse availability string (e.g., "2/2" -> available: 2, total: 2)
      const [available, total] = book.availability.split("/").map(Number);

      return {
        book_id: book.bookId,
        title: book.title,
        language: book.language,
        book_status: book.bookStatus as "Active" | "Inactive" | "Deleted",
        description: book.description,
        coverImg: book.coverImg,
        category_id: 1, // Default category
        category_name: "Văn học", // Default category name
        authors: [
          {
            author_id: book.bookId, // Use bookId as author_id for now
            author_name: book.author,
            bio: "",
          },
        ],
        volumes: [
          {
            volume_id: book.bookId,
            volume_number: parseInt(book.volumn) || 1,
            volume_title: book.title,
            description: book.description,
            variants: [],
          },
        ],
        total_copies: total || 0,
        available_copies: available || 0,
        borrowed_copies: (total || 0) - (available || 0),
        reserved_copies: 0,
        damaged_copies: 0,
        lost_copies: 0,
      };
    });

    return {
      books: transformedBooks,
      totalCount: transformedBooks.length,
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  }
};

// Search books using OData $filter
export const searchBooks = async (
  query: string
): Promise<BookWithDetails[]> => {
  // Create filter for title, author, and description
  const filter = `contains(tolower(title), tolower('${query}')) or contains(tolower(author), tolower('${query}')) or contains(tolower(description), tolower('${query}'))`;

  const odataQuery = buildODataQuery({
    $filter: filter,
    $orderby: "title",
  });

  try {
    const response = await apiRequest<ODataResponse<ApiBook> | ApiBookResponse>(
      `${BOOKS_API_BASE}${odataQuery}`
    );

    // Handle OData response format
    let booksData: ApiBook[];
    if ("value" in response && response.value) {
      // New OData format
      booksData = response.value;
    } else if ("$values" in response && response.$values) {
      // Old format (fallback)
      booksData = response.$values;
    } else {
      // Direct array (fallback)
      booksData = Array.isArray(response) ? response : [];
    }
    // Transform the data to match our expected structure
    const transformedBooks = booksData.map((book: ApiBook) => {
      // Parse availability string (e.g., "2/2" -> available: 2, total: 2)
      const [available, total] = book.availability.split("/").map(Number);

      return {
        book_id: book.bookId,
        title: book.title,
        language: book.language,
        book_status: book.bookStatus as "Active" | "Inactive" | "Deleted",
        description: book.description,
        coverImg: book.coverImg,
        category_id: 1, // Default category
        category_name: "Văn học", // Default category name
        authors: [
          {
            author_id: book.bookId, // Use bookId as author_id for now
            author_name: book.author,
            bio: "",
          },
        ],
        volumes: [
          {
            volume_id: book.bookId,
            volume_number: parseInt(book.volumn) || 1,
            volume_title: book.title,
            description: book.description,
            variants: [],
          },
        ],
        total_copies: total || 0,
        available_copies: available || 0,
        borrowed_copies: (total || 0) - (available || 0),
        reserved_copies: 0,
        damaged_copies: 0,
        lost_copies: 0,
      };
    });

    return transformedBooks;
  } catch (error) {
    console.error("Error searching books:", error);
    throw new Error("Failed to search books");
  }
};

// Get book by ID
export const getBookById = async (
  bookId: number
): Promise<BookWithDetails | null> => {
  const query = buildODataQuery({
    $expand: [
      "authors",
      "volumes($expand=variants($expand=publisher,edition,cover_type,paper_quality))",
      "category",
    ],
  });

  try {
    const book = await apiRequest<BookWithDetails>(
      `${BOOKS_API_BASE}(${bookId})${query}`
    );
    return book;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
};

// Create new book with image upload
export const createBookWithImage = async (
  bookData: BookCreateRequestWithFile
): Promise<BookWithDetails> => {
  try {
    const formData = new FormData();
    
    formData.append("Title", bookData.title);
    formData.append("Language", bookData.language);
    formData.append("BookStatus", bookData.bookStatus);
    formData.append("Description", bookData.description);
    formData.append("CategoryId", bookData.categoryId.toString());
    formData.append("AuthorIds", bookData.authorIds.join(","));
    
    if (bookData.coverImage) {
      formData.append("CoverImage", bookData.coverImage);
    }

    // Add volumes data if provided
    if (bookData.volumes && bookData.volumes.length > 0) {
      bookData.volumes.forEach((volume, index) => {
        if (volume.volumeId) {
          formData.append(`Volumes[${index}].VolumeId`, volume.volumeId.toString());
        }
        formData.append(`Volumes[${index}].VolumeNumber`, volume.volumeNumber.toString());
        if (volume.volumeTitle) {
          formData.append(`Volumes[${index}].VolumeTitle`, volume.volumeTitle);
        }
        if (volume.description) {
          formData.append(`Volumes[${index}].Description`, volume.description);
        }
      });
    }
    
    const response = await fetch(`${BOOKS_API_BASE}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const createdBook = await response.json();
    return createdBook;
  } catch (error) {
    console.error("Error creating book with image:", error);
    throw new Error("Failed to create book with image");
  }
};

// Update book using PATCH (OData Delta)
export const updateBook = async (
  bookId: number,
  updates: Partial<BookWithDetails>
): Promise<BookWithDetails> => {
  try {
    const updatedBook = await apiRequest<BookWithDetails>(
      `${BOOKS_API_BASE}(${bookId})`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
    return updatedBook;
  } catch (error) {
    console.error("Error updating book:", error);
    throw new Error("Failed to update book");
  }
};

// Update book with image upload
export const updateBookWithImage = async (
  bookId: number,
  bookData: BookCreateRequestWithFile
): Promise<BookWithDetails> => {
  console.log("🚀 ~ updateBookWithImage ~ bookId:", bookId)
  try {
    const formData = new FormData();

    formData.append("Title", bookData.title);
    formData.append("Language", bookData.language);
    formData.append("BookStatus", bookData.bookStatus);
    formData.append("Description", bookData.description);
    formData.append("CategoryId", bookData.categoryId.toString());
    formData.append("AuthorIds", bookData.authorIds.join(","));

    // Add cover image if provided
    if (bookData.coverImage) {
      formData.append("coverImage", bookData.coverImage);
    }

    // Add volumes data if provided
    if (bookData.volumes && bookData.volumes.length > 0) {
      bookData.volumes.forEach((volume, index) => {
        if (volume.volumeId) {
          formData.append(`Volumes[${index}].VolumeId`, volume.volumeId.toString());
        }
        formData.append(`Volumes[${index}].VolumeNumber`, volume.volumeNumber.toString());
        if (volume.volumeTitle) {
          formData.append(`Volumes[${index}].VolumeTitle`, volume.volumeTitle);
        }
        if (volume.description) {
          formData.append(`Volumes[${index}].Description`, volume.description);
        }
      });
    }

    const response = await fetch(`${BOOKS_API_BASE}/${bookId}`, {
      method: "PUT",
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for FormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const updatedBook = await response.json();
    return updatedBook;
  } catch (error) {
    console.error("Error updating book with image:", error);
    throw new Error("Failed to update book with image");
  }
};

// Delete book
export const deleteBook = async (bookId: number): Promise<void> => {
  try {
    const response = await fetch(`${BOOKS_API_BASE}/${bookId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error("Error deleting book:", error);
    throw new Error("Failed to delete book");
  }
};
// Delete book functionality has been disabled for data protection

// Get books with pagination info
export const fetchBooksWithPagination = async (
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryFilter?: string;
    statusFilter?: string;
    orderBy?: string;
  } = {}
): Promise<{
  books: BookWithDetails[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}> => {
  const {
    page = 0,
    pageSize = 10,
    search,
    categoryFilter,
    statusFilter,
    orderBy = "title",
  } = options;

  const filters: string[] = [];

  if (search) {
    filters.push(
      `contains(tolower(title), tolower('${search}')) or contains(tolower(category_name), tolower('${search}')) or authors/any(a: contains(tolower(a/author_name), tolower('${search}')))`
    );
  }

  if (categoryFilter) {
    filters.push(`category_name eq '${categoryFilter}'`);
  }

  if (statusFilter) {
    filters.push(`book_status eq '${statusFilter}'`);
  }

  // Get books with pagination
  const booksQuery = buildODataQuery({
    $expand: [
      "authors",
      "volumes($expand=variants($expand=publisher,edition,cover_type,paper_quality))",
      "category",
    ],
    $filter: filters.length > 0 ? filters.join(" and ") : undefined,
    $orderby: orderBy,
    $top: pageSize,
    $skip: page * pageSize,
  });

  // Get total count
  const countQuery = buildODataQuery({
    $filter: filters.length > 0 ? filters.join(" and ") : undefined,
    $count: true,
  });

  try {
    const [books, countResponse] = await Promise.all([
      apiRequest<BookWithDetails[]>(`${BOOKS_API_BASE}${booksQuery}`),
      apiRequest<{ "@odata.count": number }>(`${BOOKS_API_BASE}${countQuery}`),
    ]);

    const totalCount = countResponse["@odata.count"] || 0;
    const hasNextPage = (page + 1) * pageSize < totalCount;
    const hasPreviousPage = page > 0;

    return {
      books,
      totalCount,
      hasNextPage,
      hasPreviousPage,
    };
  } catch (error) {
    console.error("Error fetching books with pagination:", error);
    throw new Error("Failed to fetch books");
  }
};

// Get book categories for filtering
export const fetchBookCategories = async (): Promise<
  { category_id: number; category_name: string }[]
> => {
  try {
    const categories = await apiRequest<
      { category_id: number; category_name: string }[]
    >(`${ENV.apiUrl}/manage/Category`);
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Get book statuses for filtering
export const fetchBookStatuses = async (): Promise<string[]> => {
  try {
    const statuses = await apiRequest<string[]>(
      `${ENV.apiUrl}/manage/Book/statuses`
    );
    return statuses;
  } catch (error) {
    console.error("Error fetching book statuses:", error);
    return ["Active", "Inactive", "Deleted"];
  }
};

// Get book details by ID for editing
export const getBookDetails = async (
  bookId: number
): Promise<BookDetailApiResponse | null> => {
  try {
    const response = await fetch(`${ENV.apiUrl}/api/manage/Book/${bookId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const bookDetails = await response.json();
    return bookDetails;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${ENV.apiUrl}/api/manage/Book?$top=1`);
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};
