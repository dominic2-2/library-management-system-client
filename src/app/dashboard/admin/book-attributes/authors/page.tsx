"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  Snackbar,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { AuthorsTable } from "@/components/table/authors-table";
import { AuthorDialog, AuthorFormData } from "@/components/form/author-dialog";
import {
  AuthorService,
  PaginatedAuthorsResponse,
} from "@/services/author-service";
import { Author } from "@/types/author";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pageSize = 10;

  const fetchAuthors = async (
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
      // Use real API with pagination
      const result: PaginatedAuthorsResponse =
        await AuthorService.getAuthorsPaginated({
          page,
          pageSize,
          searchName: search,
        });

      if (resetData || page === 0) {
        setAuthors(result.data);
      } else {
        setAuthors((prev) => [...prev, ...result.data]);
      }

      setHasNextPage(result.hasNextPage);
      setCurrentPage(result.currentPage);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error fetching authors:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch authors",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchAuthors(currentPage + 1, searchTerm, false);
    }
  }, [loadingMore, hasNextPage, currentPage, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchAuthors(0, "");
  }, []);

  // Refresh data when returning from form page
  useEffect(() => {
    const handleFocus = () => {
      // Refresh the first page when window gains focus (user returns from form)
      setCurrentPage(0);
      fetchAuthors(0, searchTerm, true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [searchTerm]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchAuthors(0, searchTerm, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingAuthor(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: Author) => {
    setEditingAuthor(item);
    setDialogOpen(true);
  };

  const handleDelete = async (item: Author) => {
    if (
      window.confirm(`Are you sure you want to delete "${item.authorName}"?`)
    ) {
      try {
        await AuthorService.deleteAuthor(item.authorId);
        setSnackbar({
          open: true,
          message: "Author deleted successfully",
          severity: "success",
        });
        // Refresh the first page after deletion
        setCurrentPage(0);
        fetchAuthors(0, searchTerm, true);
      } catch (error) {
        console.error("Error deleting author:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete author",
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDialogSubmit = async (data: AuthorFormData, photo?: File) => {
    try {
      const authorData = {
        authorName: data.authorName,
        authorBio: data.authorBio,
        nationality: data.nationality || "",
        genre: data.genre || "",
        photo: photo, // Pass the actual file
      };

      if (editingAuthor) {
        // Update existing author
        const success = await AuthorService.updateAuthorWithFile({
          authorId: editingAuthor.authorId,
          ...authorData,
        });

        if (success) {
          setSnackbar({
            open: true,
            message: "Author updated successfully",
            severity: "success",
          });
        } else {
          throw new Error("Update failed");
        }
      } else {
        // Create new author
        await AuthorService.createAuthorWithFile(authorData);
        setSnackbar({
          open: true,
          message: "Author created successfully",
          severity: "success",
        });
      }

      setDialogOpen(false);
      setEditingAuthor(null);
      // Refresh the first page after create/update
      setCurrentPage(0);
      fetchAuthors(0, searchTerm, true);
    } catch (error) {
      console.error("Error saving author:", error);
      setSnackbar({
        open: true,
        message: editingAuthor
          ? "Failed to update author"
          : "Failed to create author",
        severity: "error",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAuthor(null);
  };

  return (
    <Box>
      <AuthorsTable
        data={authors}
        loading={loading}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        totalCount={totalCount}
        enableInfiniteScroll={true}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        searchInput={
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Search Authors"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by author name..."
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

      {/* Add/Edit Author Dialog */}
      <AuthorDialog
        open={dialogOpen}
        author={editingAuthor}
        onSubmit={handleDialogSubmit}
        onClose={handleCloseDialog}
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
