"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Container,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import { BooksTable } from "@/components/table/books-table";
import { AddBookForm } from "@/components/form/add-book-form";
import { BookWithDetails } from "@/types/book";
import { ENV } from "@/config/env";
import {
  fetchBooks,
  testApiConnection,
  createBookWithImage,
} from "@/services/book-service";

export default function BookManagePage(): JSX.Element {
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [addBookOpen, setAddBookOpen] = useState<boolean>(false);
  const [addingBook, setAddingBook] = useState<boolean>(false);

  const BOOKS_PER_PAGE = 10;
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial books
  const loadInitialBooks = useCallback(
    async (search?: string): Promise<void> => {
      try {
        setLoading(true);
        setBooks([]);
        setCurrentOffset(0);
        setHasMoreData(true);

        // Test API connection first
        const isConnected = await testApiConnection();
        setApiConnected(isConnected);
        if (!isConnected) {
          console.error("API connection failed");
          return;
        }

        const booksData = await fetchBooks({
          page: 0,
          pageSize: BOOKS_PER_PAGE,
          orderBy: "title",
          search: search?.trim() || undefined,
        });

        setBooks(booksData.books);
        setCurrentOffset(BOOKS_PER_PAGE);
        setHasMoreData(booksData.books.length === BOOKS_PER_PAGE);
        console.log("🚀 ~ BookManagePage ~ books:", books);
      } catch (error) {
        console.error("Error fetching initial books:", error);
        setBooks([]);
        setHasMoreData(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load more books for infinite scroll
  const loadMoreBooks = useCallback(async (): Promise<void> => {
    if (!hasMoreData || loadingMore || loading) return;

    try {
      setLoadingMore(true);

      const booksData = await fetchBooks({
        page: Math.floor(currentOffset / BOOKS_PER_PAGE),
        pageSize: BOOKS_PER_PAGE,
        orderBy: "title",
        search: searchQuery.trim() || undefined,
      });

      if (booksData.books.length === 0) {
        setHasMoreData(false);
      } else {
        setBooks((prevBooks) => [...prevBooks, ...booksData.books]);
        setCurrentOffset((prev) => prev + booksData.books.length);
        setHasMoreData(booksData.books.length === BOOKS_PER_PAGE);
        console.log("🚀 ~ BookManagePage ~ books:", books);
      }
    } catch (error) {
      console.error("Error loading more books:", error);
      setHasMoreData(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentOffset, hasMoreData, loadingMore, loading, searchQuery]);

  // Handle scroll events
  const handleScroll = useCallback((): void => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user scrolls to 80% of the page
      if (scrollTop + windowHeight >= documentHeight * 0.8) {
        loadMoreBooks();
      }
    }, 100);
  }, [loadMoreBooks]);

  // Initial load
  useEffect(() => {
    loadInitialBooks();
  }, [loadInitialBooks]);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadInitialBooks(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, loadInitialBooks]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(event.target.value);
  };

  const handleViewBook = (bookId: number): void => {
    console.log("View book:", bookId);
    // Navigate to book detail page
  };

  const handleEditBook = (bookId: number): void => {
    console.log("Edit book:", bookId);
    // Navigate to book edit page
  };

  const handleAddBook = async (
    bookData: {
      title: string;
      language: string;
      bookStatus: string;
      description: string;
      categoryId: number;
      authors: { authorName: string; bio?: string }[];
    },
    coverImage?: File
  ): Promise<void> => {
    try {
      setAddingBook(true);
      console.log("Adding book:", bookData);

      if (coverImage) {
        console.log("Cover image:", coverImage.name, coverImage.size);
      }

      const createdBook = await createBookWithImage(bookData, coverImage);
      console.log("Created book:", createdBook);

      // Close the dialog after successful creation
      setAddBookOpen(false);

      // Refresh books list
      await loadInitialBooks(searchQuery);

      alert("Sách đã được thêm thành công!");
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book. Please try again.");
    } finally {
      setAddingBook(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mb: 3, flex: 1 }}>
        <Paper sx={{ p: 3 }}>
          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "medium" }}
              >
                Library Books
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddBookOpen(true)}
                sx={{
                  bgcolor: "#2c5aa0",
                  "&:hover": { bgcolor: "#1e3f6b" },
                }}
              >
                Thêm Sách
              </Button>
            </Box>
            {!apiConnected && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  bgcolor: "rgba(244, 67, 54, 0.1)",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                }}
              >
                ⚠️ API Connection Failed - Check your backend at {ENV.apiUrl}
              </Typography>
            )}
          </Box>

          {/* Controls */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              mb: 3,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Loading {BOOKS_PER_PAGE} books at a time. Scroll down to load
              more.
            </Typography>
            <Box sx={{ minWidth: 200 }}>
              <TextField
                size="small"
                placeholder="search here..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: "100%" }}
              />
            </Box>
          </Box>

          {/* Books Table */}
          <BooksTable
            books={books}
            loading={loading}
            onView={handleViewBook}
            onEdit={handleEditBook}
          />

          {/* Loading More Indicator */}
          {loadingMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
              }}
            >
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Loading more books...
              </Typography>
            </Box>
          )}

          {/* No More Data Indicator */}
          {!hasMoreData && books.length > 0 && !loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No more books to load
              </Typography>
            </Box>
          )}

          {/* Table Info */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Showing {books.length} books total
              {hasMoreData && " (scroll down for more)"}
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Add Book Form Dialog */}
      <AddBookForm
        open={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        onSubmit={handleAddBook}
        loading={addingBook}
      />
    </Box>
  );
}
