import {
  PaperQuality,
  PaperQualityCreateRequest,
  PaperQualityUpdateRequest,
} from "@/types/paper-quality";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiPaperQualityItem {
  $id: string;
  paperQualityId: number;
  paperQualityName: string;
  bookCount: number;
}

// Pagination interfaces
export interface PaginatedPaperQualitiesResponse {
  data: PaperQuality[];
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

export class PaperQualityService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  private static transformApiResponse(
    apiData: ApiPaperQualityItem[]
  ): PaperQuality[] {
    return apiData.map((item) => ({
      paperQualityId: item.paperQualityId,
      paperQualityName: item.paperQualityName,
      bookCount: item.bookCount,
    }));
  }

  static async getPaperQualities(searchName?: string): Promise<PaperQuality[]> {
    try {
      let url = this.buildUrl("PaperQualities");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(PaperQualityName), tolower('${encodedSearchName}'))`;
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

      // Nếu API trả về mảng trực tiếp (PaperQuality[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedPaperQualities = this.transformApiResponse(rawData);
      return transformedPaperQualities;
    } catch (error) {
      console.error("Error fetching paper qualities:", error);
      throw error;
    }
  }

  /**
   * Get paginated paper qualities with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getPaperQualitiesPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedPaperQualitiesResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all paper qualities from existing API
      const allPaperQualities = await this.getPaperQualities(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allPaperQualities.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allPaperQualities.length,
        hasNextPage: endIndex < allPaperQualities.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated paper qualities:", error);
      throw error;
    }
  }

  static async getPaperQualityById(id: number): Promise<PaperQuality> {
    try {
      const url = this.buildUrl(`PaperQualities/${id}`);
      console.log("Fetching paper quality by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiPaperQuality: ApiPaperQualityItem = await response.json();

      // Transform single paper quality response
      const paperQuality: PaperQuality = {
        paperQualityId: apiPaperQuality.paperQualityId,
        paperQualityName: apiPaperQuality.paperQualityName,
        bookCount: apiPaperQuality.bookCount,
      };

      return paperQuality;
    } catch (error) {
      console.error("Error fetching paper quality by ID:", error);
      throw error;
    }
  }

  static async createPaperQuality(
    data: PaperQualityCreateRequest
  ): Promise<PaperQuality> {
    try {
      const url = this.buildUrl("PaperQualities");
      console.log("Creating paper quality:", url, data);

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

      const apiPaperQuality: ApiPaperQualityItem = await response.json();

      // Transform response to PaperQuality type
      const paperQuality: PaperQuality = {
        paperQualityId: apiPaperQuality.paperQualityId,
        paperQualityName: apiPaperQuality.paperQualityName,
        bookCount: apiPaperQuality.bookCount,
      };

      return paperQuality;
    } catch (error) {
      console.error("Error creating paper quality:", error);
      throw error;
    }
  }

  static async updatePaperQuality(data: PaperQualityUpdateRequest) {
    try {
      const url = this.buildUrl(`PaperQualities/${data.paperQualityId}`);
      console.log("Updating paper quality:", url, data);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperQualityName: data.paperQualityName,
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
      console.error("Error updating paper quality:", error);
      throw error;
    }
  }

  static async deletePaperQuality(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`PaperQualities/${id}`);
      console.log("Deleting paper quality:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Paper quality deleted successfully");
    } catch (error) {
      console.error("Error deleting paper quality:", error);
      throw error;
    }
  }
}
