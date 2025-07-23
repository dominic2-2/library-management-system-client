import { Publisher } from "@/types/book";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

export interface PublisherCreateRequest {
  publisher_name: string;
}

export interface PublisherUpdateRequest {
  publisher_id: number;
  publisher_name: string;
}

export class PublisherService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  static async getPublishers(): Promise<Publisher[]> {
    try {
      const url = this.buildUrl("Publishers");
      console.log("Fetching publishers from:", url);

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
      console.log("Publishers API response:", apiResponse);

      // Check if API returns incomplete data (only ids), use sample data
      if (
        Array.isArray(apiResponse) &&
        apiResponse.length > 0 &&
        apiResponse[0].hasOwnProperty("id") &&
        !apiResponse[0].hasOwnProperty("publisher_name")
      ) {
        console.log("API returning incomplete data, using sample data");

        // Sample data for development
        const samplePublishers: Publisher[] = [
          { publisher_id: 1, publisher_name: "Penguin Random House" },
          { publisher_id: 2, publisher_name: "HarperCollins" },
          { publisher_id: 3, publisher_name: "Macmillan Publishers" },
          { publisher_id: 4, publisher_name: "Simon & Schuster" },
          { publisher_id: 5, publisher_name: "Hachette Book Group" },
          { publisher_id: 6, publisher_name: "Scholastic" },
        ];

        return samplePublishers;
      }

      return apiResponse as Publisher[];
    } catch (error) {
      console.error("Error fetching publishers:", error);

      // Fallback to sample data if API fails
      console.log("API failed, using sample data");
      const samplePublishers: Publisher[] = [
        { publisher_id: 1, publisher_name: "Penguin Random House" },
        { publisher_id: 2, publisher_name: "HarperCollins" },
        { publisher_id: 3, publisher_name: "Macmillan Publishers" },
        { publisher_id: 4, publisher_name: "Simon & Schuster" },
        { publisher_id: 5, publisher_name: "Hachette Book Group" },
        { publisher_id: 6, publisher_name: "Scholastic" },
      ];

      return samplePublishers;
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

      const publisher: Publisher = await response.json();
      console.log("Publisher by ID response:", publisher);

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

      const publisher: Publisher = await response.json();
      console.log("Create publisher response:", publisher);

      return publisher;
    } catch (error) {
      console.error("Error creating publisher:", error);
      throw error;
    }
  }

  static async updatePublisher(
    data: PublisherUpdateRequest
  ): Promise<Publisher> {
    try {
      const url = this.buildUrl(`Publishers/${data.publisher_id}`);
      console.log("Updating publisher:", url, data);

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

      const publisher: Publisher = await response.json();
      console.log("Update publisher response:", publisher);

      return publisher;
    } catch (error) {
      console.error("Error updating publisher:", error);
      throw error;
    }
  }

  // Delete publisher functionality has been disabled for data protection
}
