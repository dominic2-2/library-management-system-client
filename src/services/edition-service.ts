import {
  Edition,
  EditionCreateRequest,
  EditionUpdateRequest,
} from "@/types/edition";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiEditionItem {
  $id: string;
  editionId: number;
  editionName: string;
  bookCount: number;
}

// Pagination interfaces
export interface PaginatedEditionsResponse {
  data: Edition[];
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

export class EditionService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  private static transformApiResponse(apiData: ApiEditionItem[]): Edition[] {
    return apiData.map((item) => ({
      editionId: item.editionId,
      editionName: item.editionName,
      bookCount: item.bookCount,
    }));
  }

  static async getEditions(searchName?: string): Promise<Edition[]> {
    try {
      let url = this.buildUrl("Editions");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(EditionName), tolower('${encodedSearchName}'))`;
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

      // Nếu API trả về mảng trực tiếp (Edition[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedEditions = this.transformApiResponse(rawData);
      return transformedEditions;
    } catch (error) {
      console.error("Error fetching editions:", error);
      throw error;
    }
  }

  /**
   * Get paginated editions with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getEditionsPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedEditionsResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all editions from existing API
      const allEditions = await this.getEditions(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allEditions.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allEditions.length,
        hasNextPage: endIndex < allEditions.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated editions:", error);
      throw error;
    }
  }

  static async getEditionById(id: number): Promise<Edition> {
    try {
      const url = this.buildUrl(`Editions/${id}`);
      console.log("Fetching edition by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiEdition: ApiEditionItem = await response.json();

      // Transform single edition response
      const edition: Edition = {
        editionId: apiEdition.editionId,
        editionName: apiEdition.editionName,
        bookCount: apiEdition.bookCount,
      };

      return edition;
    } catch (error) {
      console.error("Error fetching edition by ID:", error);
      throw error;
    }
  }

  static async createEdition(data: EditionCreateRequest): Promise<Edition> {
    try {
      const url = this.buildUrl("Editions");
      console.log("Creating edition:", url, data);

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

      const apiEdition: ApiEditionItem = await response.json();

      // Transform response to Edition type
      const edition: Edition = {
        editionId: apiEdition.editionId,
        editionName: apiEdition.editionName,
        bookCount: apiEdition.bookCount,
      };

      return edition;
    } catch (error) {
      console.error("Error creating edition:", error);
      throw error;
    }
  }

  static async updateEdition(data: EditionUpdateRequest) {
    try {
      const url = this.buildUrl(`Editions/${data.editionId}`);
      console.log("Updating edition:", url, data.editionName);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ editionName: data.editionName }),
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
      console.error("Error updating edition:", error);
      throw error;
    }
  }

  static async deleteEdition(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`Editions/${id}`);
      console.log("Deleting edition:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Edition deleted successfully");
    } catch (error) {
      console.error("Error deleting edition:", error);
      throw error;
    }
  }
}
