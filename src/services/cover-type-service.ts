import { CoverType } from "@/types/book";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

export interface CoverTypeCreateRequest {
  cover_type_name: string;
}

export interface CoverTypeUpdateRequest {
  cover_type_id: number;
  cover_type_name: string;
}

export class CoverTypeService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  static async getCoverTypes(): Promise<CoverType[]> {
    try {
      const url = this.buildUrl("CoverTypes");
      console.log("Fetching cover types from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log("Cover types API response:", apiResponse);

      // Check if API returns incomplete data (only ids), use sample data
      if (
        Array.isArray(apiResponse) &&
        apiResponse.length > 0 &&
        apiResponse[0].hasOwnProperty("id") &&
        !apiResponse[0].hasOwnProperty("cover_type_name")
      ) {
        console.log("API returning incomplete data, using sample data");

        // Sample data for development
        const sampleCoverTypes: CoverType[] = [
          { cover_type_id: 1, cover_type_name: "Hardcover" },
          { cover_type_id: 2, cover_type_name: "Paperback" },
          { cover_type_id: 3, cover_type_name: "Spiral Bound" },
          { cover_type_id: 4, cover_type_name: "Board Book" },
          { cover_type_id: 5, cover_type_name: "Dust Jacket" },
        ];

        return sampleCoverTypes;
      }

      return apiResponse as CoverType[];
    } catch (error) {
      console.error("Error fetching cover types:", error);

      // Fallback to sample data if API fails
      console.log("API failed, using sample data");
      const sampleCoverTypes: CoverType[] = [
        { cover_type_id: 1, cover_type_name: "Hardcover" },
        { cover_type_id: 2, cover_type_name: "Paperback" },
        { cover_type_id: 3, cover_type_name: "Spiral Bound" },
        { cover_type_id: 4, cover_type_name: "Board Book" },
        { cover_type_id: 5, cover_type_name: "Dust Jacket" },
      ];

      return sampleCoverTypes;
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

      const coverType: CoverType = await response.json();
      console.log("Cover type by ID response:", coverType);

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

      const coverType: CoverType = await response.json();
      console.log("Create cover type response:", coverType);

      return coverType;
    } catch (error) {
      console.error("Error creating cover type:", error);
      throw error;
    }
  }

  static async updateCoverType(
    data: CoverTypeUpdateRequest
  ): Promise<CoverType> {
    try {
      const url = this.buildUrl(`CoverTypes/${data.cover_type_id}`);
      console.log("Updating cover type:", url, data);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const coverType: CoverType = await response.json();
      console.log("Update cover type response:", coverType);

      return coverType;
    } catch (error) {
      console.error("Error updating cover type:", error);
      throw error;
    }
  }

  // Delete cover type functionality has been disabled for data protection
}
