"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  Stack,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { EditionsTable } from "@/components/table/editions-table";
import {
  EditionService,
  PaginatedEditionsResponse,
} from "@/services/edition-service";
import { Edition } from "@/types/edition";

export default function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Edition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pageSize = 10;

  const fetchEditions = async (
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
      const result: PaginatedEditionsResponse =
        await EditionService.getEditionsPaginated({
          page,
          pageSize,
          searchName: search,
        });

      if (resetData || page === 0) {
        setEditions(result.data);
      } else {
        setEditions((prev) => [...prev, ...result.data]);
      }

      setHasNextPage(result.hasNextPage);
      setCurrentPage(result.currentPage);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error fetching editions:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch editions",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchEditions(currentPage + 1, searchTerm, false);
    }
  }, [loadingMore, hasNextPage, currentPage, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchEditions(0, "");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchEditions(0, searchTerm, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: Edition) => {
    setEditingItem(item);
    setFormData({ name: item.editionName });
    setFormOpen(true);
  };

  const handleDelete = async (item: Edition) => {
    if (
      window.confirm(`Are you sure you want to delete "${item.editionName}"?`)
    ) {
      try {
        await EditionService.deleteEdition(item.editionId);
        setSnackbar({
          open: true,
          message: "Edition deleted successfully",
          severity: "success",
        });
        // Refresh the first page after deletion
        setCurrentPage(0);
        fetchEditions(0, searchTerm, true);
      } catch (error) {
        console.error("Error deleting edition:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete edition",
          severity: "error",
        });
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Edition name is required",
        severity: "error",
      });
      return;
    }

    try {
      let success = false;

      if (editingItem) {
        success = await EditionService.updateEdition({
          editionId: editingItem.editionId,
          editionName: formData.name,
        });

        if (success) {
          setSnackbar({
            open: true,
            message: "Edition updated successfully",
            severity: "success",
          });
        } else {
          throw new Error("Update failed");
        }
      } else {
        await EditionService.createEdition({ editionName: formData.name });
        setSnackbar({
          open: true,
          message: "Edition created successfully",
          severity: "success",
        });
      }

      setFormOpen(false);
      // Refresh the first page after create/update
      setCurrentPage(0);
      fetchEditions(0, searchTerm, true);
    } catch (error) {
      console.error("Error saving edition:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update edition"
          : "Failed to create edition",
        severity: "error",
      });
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({ name: "" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <EditionsTable
        data={editions}
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
                label="Search Editions"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by edition name..."
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

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Edition" : "Add New Edition"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Edition Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {editingItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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
