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
import { CoverTypesTable } from "@/components/table/cover-types-table";
import { CoverType } from "@/types/CoverType";
import {
  CoverTypeService,
  PaginatedCoverTypesResponse,
} from "@/services/cover-type-service";

export default function CoverTypesPage() {
  const [coverTypes, setCoverTypes] = useState<CoverType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CoverType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pageSize = 10;

  const fetchCoverTypes = async (
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
      const result: PaginatedCoverTypesResponse =
        await CoverTypeService.getCoverTypesPaginated({
          page,
          pageSize,
          searchName: search,
        });

      if (resetData || page === 0) {
        setCoverTypes(result.data);
      } else {
        setCoverTypes((prev) => [...prev, ...result.data]);
      }

      setHasNextPage(result.hasNextPage);
      setCurrentPage(result.currentPage);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error fetching cover types:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch cover types",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchCoverTypes(currentPage + 1, searchTerm, false);
    }
  }, [loadingMore, hasNextPage, currentPage, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchCoverTypes(0, "");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchCoverTypes(0, searchTerm, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: CoverType) => {
    setEditingItem(item);
    setFormData({ name: item.coverTypeName });
    setFormOpen(true);
  };

  const handleDelete = async (item: CoverType) => {
    if (
      window.confirm(`Are you sure you want to delete "${item.coverTypeName}"?`)
    ) {
      try {
        await CoverTypeService.deleteCoverType(item.coverTypeId);
        setSnackbar({
          open: true,
          message: "Cover type deleted successfully",
          severity: "success",
        });
        // Refresh the first page after deletion
        setCurrentPage(0);
        fetchCoverTypes(0, searchTerm, true);
      } catch (error) {
        console.error("Error deleting cover type:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete cover type",
          severity: "error",
        });
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Cover type name is required",
        severity: "error",
      });
      return;
    }

    try {
      let success = false;

      if (editingItem) {
        success = await CoverTypeService.updateCoverType({
          coverTypeId: editingItem.coverTypeId,
          coverTypeName: formData.name,
        });

        if (success) {
          setSnackbar({
            open: true,
            message: "Cover type updated successfully",
            severity: "success",
          });
        } else {
          throw new Error("Update failed");
        }
      } else {
        await CoverTypeService.createCoverType({
          coverTypeName: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Cover type created successfully",
          severity: "success",
        });
      }

      setFormOpen(false);
      // Refresh the first page after create/update
      setCurrentPage(0);
      fetchCoverTypes(0, searchTerm, true);
    } catch (error) {
      console.error("Error saving cover type:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update cover type"
          : "Failed to create cover type",
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
      <CoverTypesTable
        data={coverTypes}
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
                label="Search Cover Types"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by cover type name..."
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
          {editingItem ? "Edit Cover Type" : "Add New Cover Type"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Cover Type Name"
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
