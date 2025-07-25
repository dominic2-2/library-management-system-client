import { BookWithDetails } from "@/types/book";
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
const BOOKS_API_BASE = `${ENV.apiUrl}/api/manage/Book`;

// HTTP request helper
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  console.log(`Making API request to: ${url}`);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Response data structure:`, data);
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
    console.log("Fetching books with query:", `${BOOKS_API_BASE}${query}`);

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
    console.log(`Books data:`, booksData);

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

// Create new book
export const createBook = async (
  book: Partial<BookWithDetails>
): Promise<BookWithDetails> => {
  try {
    const createdBook = await apiRequest<BookWithDetails>(BOOKS_API_BASE, {
      method: "POST",
      body: JSON.stringify(book),
    });
    return createdBook;
  } catch (error) {
    console.error("Error creating book:", error);
    throw new Error("Failed to create book");
  }
};

// Create new book with image upload
export const createBookWithImage = async (
  bookData: {
    title: string;
    language: string;
    bookStatus: string;
    description: string;
    categoryId: number;
    authors: { authorName: string; bio?: string }[];
  },
  coverImage?: File
): Promise<BookWithDetails> => {
  try {
    const formData = new FormData();

    // Add book data as JSON string
    formData.append("bookData", JSON.stringify(bookData));

    // Add cover image if provided
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    console.log("Creating book with image:", bookData, coverImage?.name);

    const response = await fetch(`${BOOKS_API_BASE}/with-image`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for FormData
    });

    console.log(`Create book response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Create book API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const createdBook = await response.json();
    console.log("Book created successfully:", createdBook);
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
      `${ENV.apiUrl}/api/manage/Book/statuses`
    );
    return statuses;
  } catch (error) {
    console.error("Error fetching book statuses:", error);
    return ["Active", "Inactive", "Deleted"];
  }
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log(`Testing API connection to: ${ENV.apiUrl}`);
    const response = await fetch(`${ENV.apiUrl}/api/manage/Book?$top=1`);
    console.log(`API test response status: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};
