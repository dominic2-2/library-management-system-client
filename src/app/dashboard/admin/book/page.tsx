"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Container,
  Button,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";

import { Search as SearchIcon } from "@mui/icons-material";
import { BooksTable } from "@/components/table/books-table";
import { AddBookForm } from "@/components/form/add-book-form";
import { BookWithDetails } from "@/types/book";
import {
  fetchBooks,
  testApiConnection,
  createBookWithImage,
  updateBookWithImage,
  deleteBook,
  getBookDetails,
} from "@/services/book-service";
import { AuthorService } from "@/services/author-service";
import { CategoryService } from "@/services/category-service";

export default function BookManagePage(): JSX.Element {
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [addBookOpen, setAddBookOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<BookWithDetails | null>(null);
  const [addingBook, setAddingBook] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pageSize = 10;

  const fetchBooksData = async (
    page: number = 0,
    search?: string,
    resetData: boolean = true
  ) => {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Test API connection first
      const isConnected = await testApiConnection();
      setApiConnected(isConnected);
      if (!isConnected) {
        console.error("API connection failed");
        return;
      }

      const result = await fetchBooks({
        page,
        pageSize,
        orderBy: "title",
        search: search?.trim() || undefined,
      });

      if (resetData || page === 0) {
        setBooks(result.books);
      } else {
        setBooks((prev) => [...prev, ...result.books]);
      }

      setHasNextPage(result.books.length === pageSize);
      setCurrentPage(page);
      setTotalCount(result.books.length + page * pageSize);
    } catch (error) {
      console.error("Error fetching books:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch books",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchBooksData(currentPage + 1, searchTerm, false);
    }
  }, [loadingMore, hasNextPage, currentPage, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchBooksData(0, "");
  }, []);

  // Refresh data when returning from form page
  useEffect(() => {
    const handleFocus = () => {
      // Refresh the first page when window gains focus (user returns from form)
      setCurrentPage(0);
      fetchBooksData(0, searchTerm, true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [searchTerm]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchBooksData(0, searchTerm, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingBook(null);
    setAddBookOpen(true);
  };

  const handleEdit = async (book: BookWithDetails) => {
    try {
      setLoading(true);
      
      // Fetch detailed book information from API
      const bookDetails = await getBookDetails(book.book_id);
      
      if (!bookDetails) {
        setSnackbar({
          open: true,
          message: "Failed to fetch book details",
          severity: "error",
        });
        return;
      }

      // Fetch all authors and categories to match names with IDs
      const [allAuthors, allCategories] = await Promise.all([
        AuthorService.getAuthors(),
        CategoryService.getCategories(),
      ]);
      
      // Convert API response to the format expected by the form
      const editingBookData: BookWithDetails = {
        book_id: bookDetails.bookId,
        title: bookDetails.title,
        language: bookDetails.language || "",
        book_status: bookDetails.bookStatus as "Active" | "Inactive" | "Deleted",
        description: bookDetails.description || "",
        coverImg: bookDetails.coverImg,
        category_id: allCategories.find(cat => cat.categoryName === bookDetails.categoryName)?.categoryId || 1,
        category_name: bookDetails.categoryName || "",
        authors: bookDetails.authorNames.$values.map((authorName, index) => {
          // Try to match author name with existing author IDs
          const matchedAuthor = allAuthors.find(author => author.authorName === authorName);
          return {
            author_id: matchedAuthor?.authorId || index + 1000, // Fallback ID
            author_name: authorName,
            bio: "",
          };
        }),
        volumes: bookDetails.volumes.$values.map(vol => ({
          volume_id: vol.volumeId,
          volume_number: vol.volumeNumber,
          volume_title: vol.volumeTitle,
          variants: [],
        })),
        total_copies: 0,
        available_copies: 0,
        borrowed_copies: 0,
        reserved_copies: 0,
        damaged_copies: 0,
        lost_copies: 0,
      };

      setEditingBook(editingBookData);
      setAddBookOpen(true);
    } catch (error) {
      console.error("Error fetching book details:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch book details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book: BookWithDetails) => {
    if (
      window.confirm(`Are you sure you want to delete "${book.title}"?`)
    ) {
      try {
        await deleteBook(book.book_id);
        setSnackbar({
          open: true,
          message: "Book deleted successfully",
          severity: "success",
        });
        // Refresh the first page after deletion
        setCurrentPage(0);
        fetchBooksData(0, searchTerm, true);
      } catch (error) {
        console.error("Error deleting book:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete book",
          severity: "error",
        });
      }
    }
  };

  const handleViewBook = (bookId: number): void => {
    console.log("View book:", bookId);
    // Navigate to book detail page
  };

  const handleDialogSubmit = async (
    bookData: {
      title: string;
      language: string;
      bookStatus: string;
      description: string;
      categoryId: number;
      authorIds: number[];
      volumes: Array<{
        volumeId?: number;
        volumeNumber: number;
        volumeTitle?: string;
        description?: string;
      }>;
    },
    coverImage?: File
  ): Promise<void> => {
    try {
      setAddingBook(true);
      console.log("Submitting book:", bookData);

      if (coverImage) {
        console.log("Cover image:", coverImage.name, coverImage.size);
      }

      if (editingBook) {
        // Update existing book
        const bookDataWithImage = { 
          ...bookData, 
          coverImage,
          volumes: bookData.volumes.map(vol => ({
            volumeId: vol.volumeId, // Include volumeId for existing volumes during updates
            volumeNumber: vol.volumeNumber,
            volumeTitle: vol.volumeTitle,
            description: vol.description
          }))
        };
        const updatedBook = await updateBookWithImage(editingBook.book_id, bookDataWithImage);
        console.log("Updated book:", updatedBook);
        setSnackbar({
          open: true,
          message: "Book updated successfully",
          severity: "success",
        });
      } else {
        // Create new book
        const bookDataWithImage = { 
          ...bookData, 
          coverImage,
          volumes: bookData.volumes.map(vol => ({
            volumeId: vol.volumeId, // Will be undefined for new volumes, which is correct
            volumeNumber: vol.volumeNumber,
            volumeTitle: vol.volumeTitle,
            description: vol.description
          }))
        };
        const createdBook = await createBookWithImage(bookDataWithImage);
        console.log("Created book:", createdBook);
        setSnackbar({
          open: true,
          message: "Book created successfully",
          severity: "success",
        });
      }

      setAddBookOpen(false);
      setEditingBook(null);
      // Refresh the first page after create/update
      setCurrentPage(0);
      fetchBooksData(0, searchTerm, true);
    } catch (error) {
      console.error("Error saving book:", error);
      setSnackbar({
        open: true,
        message: editingBook ? "Failed to update book" : "Failed to create book",
        severity: "error",
      });
    } finally {
      setAddingBook(false);
    }
  };

  const handleCloseDialog = () => {
    setAddBookOpen(false);
    setEditingBook(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mb: 3, flex: 1 }}>
      
          <BooksTable
            books={books}
            loading={loading}
            loadingMore={loadingMore}
            hasNextPage={hasNextPage}
            onLoadMore={handleLoadMore}
            totalCount={totalCount}
            enableInfiniteScroll={true}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleViewBook}
            showActions={true}
            apiConnected={apiConnected}
            searchInput={
              <Box sx={{ p: 2, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Search Books"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, description..."
                    sx={{ minWidth: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {searchTerm && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </Stack>
              </Box>
            }
          />
      </Container>

      {/* Add/Edit Book Form Dialog */}
      <AddBookForm
        open={addBookOpen}
        onClose={handleCloseDialog}
        onSubmit={handleDialogSubmit}
        loading={addingBook}
        book={editingBook}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
