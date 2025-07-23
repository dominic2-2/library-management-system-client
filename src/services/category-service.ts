import { Category } from "@/types/book";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

export interface CategoryCreateRequest {
  category_name: string;
}

export interface CategoryUpdateRequest {
  category_id: number;
  category_name: string;
}

// API response interfaces
interface ApiCategoryItem {
  $id: string;
  categoryId: number;
  categoryName: string;
  bookCount: number;
}

interface ApiCategoriesResponse {
  $id: string;
  $values: ApiCategoryItem[];
}

export class CategoryService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/api/${endpoint}`;
  }

  private static transformApiResponse(apiData: ApiCategoryItem[]): Category[] {
    return apiData.map((item) => ({
      category_id: item.categoryId,
      category_name: item.categoryName,
      book_count: item.bookCount,
    }));
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const url = this.buildUrl("Categories");
      console.log("Fetching categories from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiCategoriesResponse = await response.json();

      // Validate API response structure
      if (!apiResponse?.$values || !Array.isArray(apiResponse.$values)) {
        throw new Error("Invalid API response structure");
      }

      const transformedCategories = this.transformApiResponse(
        apiResponse.$values
      );

      return transformedCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async getCategoryById(id: number): Promise<Category> {
    try {
      const url = this.buildUrl(`Categories/${id}`);
      console.log("Fetching category by ID:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiCategory: ApiCategoryItem = await response.json();

      // Transform single category response
      const category: Category = {
        category_id: apiCategory.categoryId,
        category_name: apiCategory.categoryName,
        book_count: apiCategory.bookCount,
      };

      return category;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  }

  static async createCategory(data: CategoryCreateRequest): Promise<Category> {
    try {
      const url = this.buildUrl("Categories");
      console.log("Creating category:", url, data);

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

      const apiCategory: ApiCategoryItem = await response.json();

      // Transform response to Category type
      const category: Category = {
        category_id: apiCategory.categoryId,
        category_name: apiCategory.categoryName,
        book_count: apiCategory.bookCount,
      };

      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  static async updateCategory(data: CategoryUpdateRequest): Promise<Category> {
    try {
      const url = this.buildUrl(`Categories/${data.category_id}`);
      console.log("Updating category:", url, data);

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

      const apiCategory: ApiCategoryItem = await response.json();

      // Transform response to Category type
      const category: Category = {
        category_id: apiCategory.categoryId,
        category_name: apiCategory.categoryName,
        book_count: apiCategory.bookCount,
      };

      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      const url = this.buildUrl(`Categories/${id}`);
      console.log("Deleting category:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}
