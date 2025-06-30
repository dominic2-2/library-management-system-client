"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  AccountCircle,
} from "@mui/icons-material";
import { Sidebar } from "@/components/common/sidebar";
import { BooksTable } from "@/components/table/books-table";
import { BookWithDetails } from "@/types/book";
import { fetchBooks, searchBooks, deleteBook } from "@/services/book-service";

export default function BookManagePage(): JSX.Element {
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Mock current user - replace with actual auth context
  const currentUser = {
    full_name: "Bwire Mashauri",
    username: "bwire.mashauri",
  };

  // Fetch books on component mount
  useEffect(() => {
    const loadBooks = async (): Promise<void> => {
      try {
        setLoading(true);
        const booksData = await fetchBooks();
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Handle search functionality
  useEffect(() => {
    const handleSearch = async (): Promise<void> => {
      if (!searchQuery.trim()) {
        setFilteredBooks(books);
        return;
      }

      try {
        const searchResults = await searchBooks(searchQuery);
        setFilteredBooks(searchResults);
      } catch (error) {
        console.error("Error searching books:", error);
        setFilteredBooks([]);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, books]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(event.target.value);
  };

  const handleEntriesPerPageChange = (
    event: SelectChangeEvent<number>
  ): void => {
    setEntriesPerPage(event.target.value as number);
  };

  const handleMenuClick = (): void => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setSidebarOpen(false);
  };

  const handleViewBook = (bookId: number): void => {
    console.log("View book:", bookId);
    // Navigate to book detail page
  };

  const handleEditBook = (bookId: number): void => {
    console.log("Edit book:", bookId);
    // Navigate to book edit page
  };

  const handleDeleteBook = async (bookId: number): Promise<void> => {
    try {
      await deleteBook(bookId);
      // Refresh books list
      const updatedBooks = books.filter((book) => book.book_id !== bookId);
      setBooks(updatedBooks);
      setFilteredBooks(
        updatedBooks.filter(
          (book) =>
            !searchQuery.trim() ||
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.category_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            book.authors.some((author) =>
              author.author_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
        )
      );
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: "#2c5aa0" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Library Management System
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">{currentUser.full_name}</Typography>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
        <Paper sx={{ p: 3 }}>
          {/* Page Header */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "medium" }}
          >
            Library Books
          </Typography>

          {/* Controls */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  Show
                </Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  entries
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ ml: "auto" }}>
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
            </Grid>
          </Grid>

          {/* Books Table */}
          <BooksTable
            books={filteredBooks}
            loading={loading}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />

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
              Showing 1 to {Math.min(entriesPerPage, filteredBooks.length)} of{" "}
              {filteredBooks.length} entries
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
