import { PaperQuality } from "@/types/book";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

export interface PaperQualityCreateRequest {
  paper_quality_name: string;
}

export interface PaperQualityUpdateRequest {
  paper_quality_id: number;
  paper_quality_name: string;
}

export class PaperQualityService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  static async getPaperQualities(): Promise<PaperQuality[]> {
    try {
      const url = this.buildUrl("PaperQualities");
      console.log("Fetching paper qualities from:", url);

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
      console.log("Paper qualities API response:", apiResponse);

      // Check if API returns incomplete data (only ids), use sample data
      if (
        Array.isArray(apiResponse) &&
        apiResponse.length > 0 &&
        apiResponse[0].hasOwnProperty("id") &&
        !apiResponse[0].hasOwnProperty("paper_quality_name")
      ) {
        console.log("API returning incomplete data, using sample data");

        // Sample data for development
        const samplePaperQualities: PaperQuality[] = [
          { paper_quality_id: 1, paper_quality_name: "Premium" },
          { paper_quality_id: 2, paper_quality_name: "Standard" },
          { paper_quality_id: 3, paper_quality_name: "Recycled" },
          { paper_quality_id: 4, paper_quality_name: "Glossy" },
          { paper_quality_id: 5, paper_quality_name: "Matte" },
        ];

        return samplePaperQualities;
      }

      return apiResponse as PaperQuality[];
    } catch (error) {
      console.error("Error fetching paper qualities:", error);

      // Fallback to sample data if API fails
      console.log("API failed, using sample data");
      const samplePaperQualities: PaperQuality[] = [
        { paper_quality_id: 1, paper_quality_name: "Premium" },
        { paper_quality_id: 2, paper_quality_name: "Standard" },
        { paper_quality_id: 3, paper_quality_name: "Recycled" },
        { paper_quality_id: 4, paper_quality_name: "Glossy" },
        { paper_quality_id: 5, paper_quality_name: "Matte" },
      ];

      return samplePaperQualities;
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

      const paperQuality: PaperQuality = await response.json();
      console.log("Paper quality by ID response:", paperQuality);

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

      const paperQuality: PaperQuality = await response.json();
      console.log("Create paper quality response:", paperQuality);

      return paperQuality;
    } catch (error) {
      console.error("Error creating paper quality:", error);
      throw error;
    }
  }

  static async updatePaperQuality(
    data: PaperQualityUpdateRequest
  ): Promise<PaperQuality> {
    try {
      const url = this.buildUrl(`PaperQualities/${data.paper_quality_id}`);
      console.log("Updating paper quality:", url, data);

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

      const paperQuality: PaperQuality = await response.json();
      console.log("Update paper quality response:", paperQuality);

      return paperQuality;
    } catch (error) {
      console.error("Error updating paper quality:", error);
      throw error;
    }
  }

  // Delete paper quality functionality has been disabled for data protection
}
