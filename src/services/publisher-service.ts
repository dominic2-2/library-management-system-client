import {
  Publisher,
  PublisherCreateRequest,
  PublisherUpdateRequest,
} from "@/types/publisher";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiPublisherItem {
  $id: string;
  publisherId: number;
  publisherName: string;
  bookCount: number;
  address?: string;
  phone?: string;
  website?: string;
  establishedYear?: number;
}

// Pagination interfaces
export interface PaginatedPublishersResponse {
  data: Publisher[];
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

export class PublisherService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  private static transformApiResponse(
    apiData: ApiPublisherItem[]
  ): Publisher[] {
    return apiData.map((item) => ({
      publisherId: item.publisherId,
      publisherName: item.publisherName,
      bookCount: item.bookCount,
      address: item.address,
      phone: item.phone,
      website: item.website,
      establishedYear: item.establishedYear,
    }));
  }

  static async getPublishers(searchName?: string): Promise<Publisher[]> {
    try {
      let url = this.buildUrl("Publishers");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(PublisherName), tolower('${encodedSearchName}'))`;
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

      // Nếu API trả về mảng trực tiếp (Publisher[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedPublishers = this.transformApiResponse(rawData);
      return transformedPublishers;
    } catch (error) {
      console.error("Error fetching publishers:", error);
      throw error;
    }
  }

  /**
   * Get paginated publishers with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getPublishersPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedPublishersResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all publishers from existing API
      const allPublishers = await this.getPublishers(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allPublishers.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allPublishers.length,
        hasNextPage: endIndex < allPublishers.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated publishers:", error);
      throw error;
    }
  }

  static async getPublisherById(id: number): Promise<Publisher> {
    try {
      const url = this.buildUrl(`Publishers/${id}`);
      console.log("Fetching publisher by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiPublisher: ApiPublisherItem = await response.json();

      // Transform single publisher response
      const publisher: Publisher = {
        publisherId: apiPublisher.publisherId,
        publisherName: apiPublisher.publisherName,
        bookCount: apiPublisher.bookCount,
        address: apiPublisher.address,
        phone: apiPublisher.phone,
        website: apiPublisher.website,
        establishedYear: apiPublisher.establishedYear,
      };

      return publisher;
    } catch (error) {
      console.error("Error fetching publisher by ID:", error);
      throw error;
    }
  }

  static async createPublisher(
    data: PublisherCreateRequest
  ): Promise<Publisher> {
    try {
      const url = this.buildUrl("Publishers");
      console.log("Creating publisher:", url, data);

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

      const apiPublisher: ApiPublisherItem = await response.json();

      // Transform response to Publisher type
      const publisher: Publisher = {
        publisherId: apiPublisher.publisherId,
        publisherName: apiPublisher.publisherName,
        bookCount: apiPublisher.bookCount,
        address: apiPublisher.address,
        phone: apiPublisher.phone,
        website: apiPublisher.website,
        establishedYear: apiPublisher.establishedYear,
      };

      return publisher;
    } catch (error) {
      console.error("Error creating publisher:", error);
      throw error;
    }
  }

  static async updatePublisher(data: PublisherUpdateRequest) {
    try {
      const url = this.buildUrl(`Publishers/${data.publisherId}`);
      console.log("Updating publisher:", url, data);

      const requestBody = {
        publisherName: data.publisherName,
        address: data.address,
        phone: data.phone,
        website: data.website,
        establishedYear: data.establishedYear,
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
      console.error("Error updating publisher:", error);
      throw error;
    }
  }

  static async deletePublisher(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`Publishers/${id}`);
      console.log("Deleting publisher:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Publisher deleted successfully");
    } catch (error) {
      console.error("Error deleting publisher:", error);
      throw error;
    }
  }
}
