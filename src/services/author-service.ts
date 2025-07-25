import {
  Author,
  AuthorCreateRequest,
  AuthorUpdateRequest,
  AuthorCreateRequestWithFile,
  AuthorUpdateRequestWithFile,
} from "@/types/author";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiAuthorItem {
  $id: string;
  authorId: number;
  authorName: string;
  authorBio: string;
  nationality: string;
  genre: string;
  photoUrl: string;
  bookCount: number;
}

// Pagination interfaces
export interface PaginatedAuthorsResponse {
  data: Author[];
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  searchName?: string;
}

export class AuthorService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  private static transformApiResponse(apiData: ApiAuthorItem[]): Author[] {
    return apiData.map((item) => ({
      authorId: item.authorId,
      authorName: item.authorName,
      authorBio: item.authorBio,
      nationality: item.nationality,
      genre: item.genre,
      photoUrl: item.photoUrl,
      bookCount: item.bookCount,
    }));
  }

  static async getAuthors(searchName?: string): Promise<Author[]> {
    try {
      let url = this.buildUrl("Authors");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(AuthorName), tolower('${encodedSearchName}'))`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Nếu API trả về mảng trực tiếp (Author[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedAuthors = this.transformApiResponse(rawData);
      return transformedAuthors;
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  }

  /**
   * Get paginated authors with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getAuthorsPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedAuthorsResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all authors from existing API
      const allAuthors = await this.getAuthors(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allAuthors.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allAuthors.length,
        hasNextPage: endIndex < allAuthors.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated authors:", error);
      throw error;
    }
  }

  static async getAuthorById(id: number): Promise<Author> {
    try {
      const url = this.buildUrl(`Authors/${id}`);
      console.log("Fetching author by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiAuthor: ApiAuthorItem = await response.json();

      // Transform single author response
      const author: Author = {
        authorId: apiAuthor.authorId,
        authorName: apiAuthor.authorName,
        authorBio: apiAuthor.authorBio,
        nationality: apiAuthor.nationality,
        genre: apiAuthor.genre,
        photoUrl: apiAuthor.photoUrl,
        bookCount: apiAuthor.bookCount,
      };

      return author;
    } catch (error) {
      console.error("Error fetching author by ID:", error);
      throw error;
    }
  }

  static async createAuthor(data: AuthorCreateRequest): Promise<Author> {
    try {
      const url = this.buildUrl("Authors");
      console.log("Creating author:", url, data);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiAuthor: ApiAuthorItem = await response.json();

      // Transform response to Author type
      const author: Author = {
        authorId: apiAuthor.authorId,
        authorName: apiAuthor.authorName,
        authorBio: apiAuthor.authorBio,
        nationality: apiAuthor.nationality,
        genre: apiAuthor.genre,
        photoUrl: apiAuthor.photoUrl,
        bookCount: apiAuthor.bookCount,
      };

      return author;
    } catch (error) {
      console.error("Error creating author:", error);
      throw error;
    }
  }

  // New method for creating author with file upload
  static async createAuthorWithFile(
    data: AuthorCreateRequestWithFile
  ): Promise<Author> {
    try {
      const url = this.buildUrl("Authors");
      console.log("Creating author with file:", url, data);

      const formData = new FormData();
      formData.append("AuthorName", data.authorName);
      formData.append("AuthorBio", data.authorBio);

      if (data.nationality) {
        formData.append("Nationality", data.nationality);
      }

      if (data.genre) {
        formData.append("Genre", data.genre);
      }

      if (data.photo) {
        formData.append("Photo", data.photo);
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData, // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiAuthor: ApiAuthorItem = await response.json();

      // Transform response to Author type
      const author: Author = {
        authorId: apiAuthor.authorId,
        authorName: apiAuthor.authorName,
        authorBio: apiAuthor.authorBio,
        nationality: apiAuthor.nationality,
        genre: apiAuthor.genre,
        photoUrl: apiAuthor.photoUrl,
        bookCount: apiAuthor.bookCount,
      };

      return author;
    } catch (error) {
      console.error("Error creating author with file:", error);
      throw error;
    }
  }

  static async updateAuthor(data: AuthorUpdateRequest) {
    try {
      const url = this.buildUrl(`Authors/${data.authorId}`);
      console.log("Updating author:", url, data);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: data.authorName,
          authorBio: data.authorBio,
          nationality: data.nationality,
          genre: data.genre,
          photoUrl: data.photoUrl,
        }),
      });

      if (response.status === 204) {
        // No content => update thành công
        return true;
      } else if (response.status === 404) {
        // Not found => thất bại
        return false;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating author:", error);
      throw error;
    }
  }

  // New method for updating author with file upload
  static async updateAuthorWithFile(
    data: AuthorUpdateRequestWithFile
  ): Promise<boolean> {
    try {
      const url = this.buildUrl(`Authors/${data.authorId}`);
      console.log("Updating author with file:", url, data);

      const formData = new FormData();
      formData.append("AuthorName", data.authorName);
      formData.append("AuthorBio", data.authorBio);

      if (data.nationality) {
        formData.append("Nationality", data.nationality);
      }

      if (data.genre) {
        formData.append("Genre", data.genre);
      }

      if (data.photo) {
        formData.append("Photo", data.photo);
      }

      const response = await fetch(url, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false; // Author not found
        }

        const errorText = await response.text();
        throw new Error(
          `Unexpected response: ${response.status} - ${errorText}`
        );
      }

      const json = await response.json();
      console.log("Updated author response:", json);

      // Optional: you could return `json.data` if needed
      return true;
    } catch (error) {
      console.error("Error updating author with file:", error);
      return false;
    }
  }

  static async deleteAuthor(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`Authors/${id}`);
      console.log("Deleting author:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Author deleted successfully");
    } catch (error) {
      console.error("Error deleting author:", error);
      throw error;
    }
  }
}
