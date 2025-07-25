import {
  CoverType,
  CoverTypeCreateRequest,
  CoverTypeUpdateRequest,
} from "@/types/CoverType";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiCoverTypeItem {
  $id: string;
  coverTypeId: number;
  coverTypeName: string;
  bookCount: number;
}

// Pagination interfaces
export interface PaginatedCoverTypesResponse {
  data: CoverType[];
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

export class CoverTypeService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/${endpoint}`;
  }

  private static transformApiResponse(
    apiData: ApiCoverTypeItem[]
  ): CoverType[] {
    return apiData.map((item) => ({
      coverTypeId: item.coverTypeId,
      coverTypeName: item.coverTypeName,
      bookCount: item.bookCount,
    }));
  }

  static async getCoverTypes(searchName?: string): Promise<CoverType[]> {
    try {
      let url = this.buildUrl("CoverTypes");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(CoverTypeName), tolower('${encodedSearchName}'))`;
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

      // Nếu API trả về mảng trực tiếp (CoverType[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedCoverTypes = this.transformApiResponse(rawData);
      return transformedCoverTypes;
    } catch (error) {
      console.error("Error fetching cover types:", error);
      throw error;
    }
  }

  /**
   * Get paginated cover types with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getCoverTypesPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedCoverTypesResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all cover types from existing API
      const allCoverTypes = await this.getCoverTypes(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allCoverTypes.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allCoverTypes.length,
        hasNextPage: endIndex < allCoverTypes.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated cover types:", error);
      throw error;
    }
  }

  static async getCoverTypeById(id: number): Promise<CoverType> {
    try {
      const url = this.buildUrl(`CoverTypes/${id}`);
      console.log("Fetching cover type by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiCoverType: ApiCoverTypeItem = await response.json();

      // Transform single cover type response
      const coverType: CoverType = {
        coverTypeId: apiCoverType.coverTypeId,
        coverTypeName: apiCoverType.coverTypeName,
        bookCount: apiCoverType.bookCount,
      };

      return coverType;
    } catch (error) {
      console.error("Error fetching cover type by ID:", error);
      throw error;
    }
  }

  static async createCoverType(
    data: CoverTypeCreateRequest
  ): Promise<CoverType> {
    try {
      const url = this.buildUrl("CoverTypes");
      console.log("Creating cover type:", url, data);

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

      const apiCoverType: ApiCoverTypeItem = await response.json();

      // Transform response to CoverType type
      const coverType: CoverType = {
        coverTypeId: apiCoverType.coverTypeId,
        coverTypeName: apiCoverType.coverTypeName,
        bookCount: apiCoverType.bookCount,
      };

      return coverType;
    } catch (error) {
      console.error("Error creating cover type:", error);
      throw error;
    }
  }

  static async updateCoverType(data: CoverTypeUpdateRequest) {
    try {
      const url = this.buildUrl(`CoverTypes/${data.coverTypeId}`);
      console.log("Updating cover type:", url, data);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverTypeName: data.coverTypeName,
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
      console.error("Error updating cover type:", error);
      throw error;
    }
  }

  static async deleteCoverType(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`CoverTypes/${id}`);
      console.log("Deleting cover type:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Cover type deleted successfully");
    } catch (error) {
      console.error("Error deleting cover type:", error);
      throw error;
    }
  }
}
