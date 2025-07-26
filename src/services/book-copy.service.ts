import { apiClient } from "./apiClient";
import {
  BookCopy,
  BookCopyResponse,
  BookCopyFilter,
  BookCopyListParams,
  DropdownOption,
  DropdownOptionWithId,
  BookVolumeForCopy,
  CreateBookCopyRequest,
  UpdateBookCopyRequest,
} from "../types/book-copy";
import { CategoryService } from "./category-service";
import { AuthorService } from "./author-service";
import { PublisherService } from "./publisher-service";
import { EditionService } from "./edition-service";
import { CoverTypeService } from "./cover-type-service";
import { PaperQualityService } from "./paper-quality-service";

const BASE_URL = `/api/manage/BookCopy`;

export const bookCopyService = {
  /**
   * Get book copies with OData support and pagination
   */
  getBookCopies: async (
    params: BookCopyListParams = {}
  ): Promise<BookCopyResponse> => {
    const searchParams = new URLSearchParams();

    // Default pagination
    searchParams.append("$top", (params.$top || 10).toString());
    searchParams.append("$skip", (params.$skip || 0).toString());
    searchParams.append("$count", (params.$count || true).toString());

    // Add filters if provided
    if (params.$filter) {
      searchParams.append("$filter", params.$filter);
    }

    // Add ordering if provided
    if (params.$orderby) {
      searchParams.append("$orderby", params.$orderby);
    }

    const response = await apiClient.get<BookCopyResponse>(
      `${BASE_URL}?${searchParams.toString()}`
    );
    return response;
  },

  /**
   * Build OData filter string from filter object
   */
  buildFilter: (filters: BookCopyFilter): string => {
    const conditions: string[] = [];

    // Search in book title and ISBN only
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      conditions.push(
        `(contains(tolower(bookTitle), '${searchTerm}') or ` +
          `contains(tolower(isbn), '${searchTerm}'))`
      );
    }

    // Individual dropdown filters
    if (filters.copyStatus) {
      conditions.push(`copyStatus eq '${filters.copyStatus}'`);
    }

    if (filters.categoryName) {
      conditions.push(`categoryName eq '${filters.categoryName}'`);
    }

    if (filters.authorName) {
      conditions.push(`authorNames/any(a: a eq '${filters.authorName}')`);
    }

    if (filters.publisherName) {
      conditions.push(`publisherName eq '${filters.publisherName}'`);
    }

    if (filters.editionName) {
      conditions.push(`editionName eq '${filters.editionName}'`);
    }

    if (filters.coverTypeName) {
      conditions.push(`coverTypeName eq '${filters.coverTypeName}'`);
    }

    if (filters.paperQualityName) {
      conditions.push(`paperQualityName eq '${filters.paperQualityName}'`);
    }

    if (filters.publicationYear) {
      conditions.push(`publicationYear eq ${filters.publicationYear}`);
    }

    // Location filter with floor and shelf
    if (filters.floor || filters.shelf) {
      const locationParts: string[] = [];
      if (filters.floor) {
        locationParts.push(
          `contains(tolower(location), 'tầng ${filters.floor}')`
        );
      }
      if (filters.shelf) {
        locationParts.push(
          `contains(tolower(location), 'kệ ${filters.shelf}')`
        );
      }
      if (locationParts.length > 0) {
        conditions.push(`(${locationParts.join(" and ")})`);
      }
    }

    return conditions.join(" and ");
  },

  /**
   * Get dropdown options for filters
   */
  getFilterOptions: {
    getCategories: async (): Promise<DropdownOption[]> => {
      try {
        const categories = await CategoryService.getCategories();
        return categories.map((cat) => ({
          value: cat.categoryName,
          label: cat.categoryName,
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },

    getAuthors: async (): Promise<DropdownOption[]> => {
      try {
        const authors = await AuthorService.getAuthors();
        return authors.map((author) => ({
          value: author.authorName,
          label: author.authorName,
        }));
      } catch (error) {
        console.error("Error fetching authors:", error);
        return [];
      }
    },

    getPublishers: async (): Promise<DropdownOption[]> => {
      try {
        const publishers = await PublisherService.getPublishers();
        return publishers.map((pub) => ({
          value: pub.publisherName,
          label: pub.publisherName,
        }));
      } catch (error) {
        console.error("Error fetching publishers:", error);
        return [];
      }
    },

    getEditions: async (): Promise<DropdownOption[]> => {
      try {
        const editions = await EditionService.getEditions();
        return editions.map((ed) => ({
          value: ed.editionName,
          label: ed.editionName,
        }));
      } catch (error) {
        console.error("Error fetching editions:", error);
        return [];
      }
    },

    getCoverTypes: async (): Promise<DropdownOption[]> => {
      try {
        const coverTypes = await CoverTypeService.getCoverTypes();
        return coverTypes.map((ct) => ({
          value: ct.coverTypeName,
          label: ct.coverTypeName,
        }));
      } catch (error) {
        console.error("Error fetching cover types:", error);
        return [];
      }
    },

    getPaperQualities: async (): Promise<DropdownOption[]> => {
      try {
        const paperQualities = await PaperQualityService.getPaperQualities();
        return paperQualities.map((pq) => ({
          value: pq.paperQualityName,
          label: pq.paperQualityName,
        }));
      } catch (error) {
        console.error("Error fetching paper qualities:", error);
        return [];
      }
    },
  },

  /**
   * Get book copy by ID
   */
  getBookCopyById: async (copyId: number): Promise<BookCopy> => {
    const response = await apiClient.get<BookCopy>(`${BASE_URL}/${copyId}`);
    return response;
  },

  /**
   * Get book volumes for copy creation
   */
  getBookVolumesForCopy: async (
    search?: string
  ): Promise<BookVolumeForCopy[]> => {
    try {
      let url = "/api/manage/Book/getBookForCopy";

      if (search && search.trim()) {
        const filter = `$filter=contains(Title,'${encodeURIComponent(
          search.trim()
        )}')`;
        url += `?${filter}`;
      }

      const response = await apiClient.get<BookVolumeForCopy[]>(url);
      return response;
    } catch (error) {
      console.error("Error fetching book volumes for copy:", error);
      return [];
    }
  },

  /**
   * Create new book copy
   */
  createBookCopy: async (
    copyData: CreateBookCopyRequest
  ): Promise<BookCopy> => {
    try {
      const response = await apiClient.post<BookCopy>(BASE_URL, copyData);
      return response;
    } catch (error) {
      console.error("Error creating book copy:", error);
      throw error;
    }
  },

  /**
   * Update book copy - only sends modified fields
   */
  updateBookCopy: async (
    copyId: number,
    updateData: UpdateBookCopyRequest
  ): Promise<BookCopy> => {
    try {
      // Only send fields that are defined (not undefined)
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      const response = await apiClient.put<BookCopy>(
        `${BASE_URL}/${copyId}`,
        filteredData
      );
      return response;
    } catch (error) {
      console.error("Error updating book copy:", error);
      throw error;
    }
  },

  /**
   * Get dropdown options with IDs for editing
   */
  getEditDropdownOptions: {
    getEditions: async (): Promise<DropdownOptionWithId[]> => {
      try {
        const editions = await EditionService.getEditions();
        return editions.map((ed) => ({
          id: ed.editionId,
          value: ed.editionName,
          label: ed.editionName,
        }));
      } catch (error) {
        console.error("Error fetching editions with IDs:", error);
        return [];
      }
    },

    getCoverTypes: async (): Promise<DropdownOptionWithId[]> => {
      try {
        const coverTypes = await CoverTypeService.getCoverTypes();
        return coverTypes.map((ct) => ({
          id: ct.coverTypeId,
          value: ct.coverTypeName,
          label: ct.coverTypeName,
        }));
      } catch (error) {
        console.error("Error fetching cover types with IDs:", error);
        return [];
      }
    },

    getPaperQualities: async (): Promise<DropdownOptionWithId[]> => {
      try {
        const paperQualities = await PaperQualityService.getPaperQualities();
        return paperQualities.map((pq) => ({
          id: pq.paperQualityId,
          value: pq.paperQualityName,
          label: pq.paperQualityName,
        }));
      } catch (error) {
        console.error("Error fetching paper qualities with IDs:", error);
        return [];
      }
    },
  },
};
