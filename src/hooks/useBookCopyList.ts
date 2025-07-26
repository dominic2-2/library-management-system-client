import { useState, useEffect, useCallback } from "react";
import { BookCopy, BookCopyFilter } from "../types/book-copy";
import { bookCopyService } from "../services/book-copy.service";

interface UseBookCopyListResult {
  bookCopies: BookCopy[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  filters: BookCopyFilter;
  setFilters: (filters: BookCopyFilter) => void;
}

const ITEMS_PER_PAGE = 10;

export const useBookCopyList = (): UseBookCopyListResult => {
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<BookCopyFilter>({});

  const fetchBookCopies = useCallback(
    async (
      pageNumber: number,
      currentFilters: BookCopyFilter,
      reset = false
    ) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        // Production code - calling real API
        const filterString = bookCopyService.buildFilter(currentFilters);
        const response = await bookCopyService.getBookCopies({
          $top: ITEMS_PER_PAGE,
          $skip: pageNumber * ITEMS_PER_PAGE,
          $filter: filterString || undefined,
          $orderby: "copyId desc",
          $count: true,
        });

        const newBookCopies = response.items.$values;

        if (reset) {
          setBookCopies(newBookCopies);
        } else {
          setBookCopies((prev) => [...prev, ...newBookCopies]);
        }

        setTotalCount(response.totalCount);
        setHasMore((pageNumber + 1) * ITEMS_PER_PAGE < response.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBookCopies(nextPage, filters, false);
    }
  }, [loading, hasMore, page, filters, fetchBookCopies]);

  const refresh = useCallback(() => {
    setPage(0);
    setBookCopies([]);
    setHasMore(true);
    fetchBookCopies(0, filters, true);
  }, [filters, fetchBookCopies]);

  const handleSetFilters = useCallback(
    (newFilters: BookCopyFilter) => {
      setFilters(newFilters);
      setPage(0);
      setBookCopies([]);
      setHasMore(true);
      fetchBookCopies(0, newFilters, true);
    },
    [fetchBookCopies]
  );

  // Initial load
  useEffect(() => {
    fetchBookCopies(0, filters, true);
  }, []);

  return {
    bookCopies,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    filters,
    setFilters: handleSetFilters,
  };
};
