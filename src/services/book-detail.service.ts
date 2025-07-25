import { ENV } from "@/config/env";
import { BookDetailResponse } from "@/types/book-detail";

export const bookDetailService = {
  async getBookDetail(bookId: number): Promise<BookDetailResponse> {
    try {
      const response = await fetch(
        `${ENV.apiUrl}/api/manage/Book/${bookId}/detail`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch book detail: ${response.statusText}`);
      }

      const data: BookDetailResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching book detail:", error);
      throw error;
    }
  },
};
