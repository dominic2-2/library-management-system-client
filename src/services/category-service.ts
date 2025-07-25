import {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "@/types/category";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5027";

// API response interfaces
interface ApiCategoryItem {
  $id: string;
  categoryId: number;
  categoryName: string;
  bookCount: number;
}

// Pagination interfaces
export interface PaginatedCategoriesResponse {
  data: Category[];
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

export class CategoryService {
  private static buildUrl(endpoint: string): string {
    return `${API_BASE_URL}/${endpoint}`;
  }

  private static transformApiResponse(apiData: ApiCategoryItem[]): Category[] {
    return apiData.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      bookCount: item.bookCount,
    }));
  }

  static async getCategories(searchName?: string): Promise<Category[]> {
    try {
      let url = this.buildUrl("Categories");

      if (searchName && searchName.trim()) {
        const encodedSearchName = encodeURIComponent(searchName.trim());
        url += `?$filter=contains(tolower(CategoryName), tolower('${encodedSearchName}'))`;
      }

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

      const rawData = await response.json();

      // Nếu API trả về mảng trực tiếp (Category[])
      if (!Array.isArray(rawData)) {
        throw new Error("Invalid API response: expected array");
      }

      const transformedCategories = this.transformApiResponse(rawData);
      return transformedCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get paginated categories with infinite scroll support
   * Uses the existing API and simulates pagination client-side until backend supports it
   */
  static async getCategoriesPaginated(
    params: PaginationParams = {}
  ): Promise<PaginatedCategoriesResponse> {
    try {
      const { page = 0, pageSize = 10, searchName } = params;

      // Get all categories from existing API
      const allCategories = await this.getCategories(searchName);

      // Simulate pagination client-side
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allCategories.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: allCategories.length,
        hasNextPage: endIndex < allCategories.length,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      console.error("Error fetching paginated categories:", error);
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
        categoryId: apiCategory.categoryId,
        categoryName: apiCategory.categoryName,
        bookCount: apiCategory.bookCount,
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
        categoryId: apiCategory.categoryId,
        categoryName: apiCategory.categoryName,
        bookCount: apiCategory.bookCount,
      };

      return category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  static async updateCategory(data: CategoryUpdateRequest) {
    try {
      const url = this.buildUrl(`Categories/${data.categoryId}`);
      console.log("Updating category:", url, data.categoryName);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: data.categoryName }),
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
