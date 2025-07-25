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
import { PublishersTable } from "@/components/table/publishers-table";
import {
  Publisher,
  PublisherCreateRequest,
  PublisherUpdateRequest,
} from "@/types/publisher";
import {
  PublisherService,
  PaginatedPublishersResponse,
} from "@/services/publisher-service";

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Publisher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    establishedYear: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pageSize = 10;

  const fetchPublishers = async (
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
      const result: PaginatedPublishersResponse =
        await PublisherService.getPublishersPaginated({
          page,
          pageSize,
          searchName: search,
        });

      if (resetData || page === 0) {
        setPublishers(result.data);
      } else {
        setPublishers((prev) => [...prev, ...result.data]);
      }

      setHasNextPage(result.hasNextPage);
      setCurrentPage(result.currentPage);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error fetching publishers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch publishers",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchPublishers(currentPage + 1, searchTerm, false);
    }
  }, [loadingMore, hasNextPage, currentPage, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchPublishers(0, "");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchPublishers(0, searchTerm, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      website: "",
      establishedYear: "",
    });
    setFormOpen(true);
  };

  const handleEdit = (item: Publisher) => {
    setEditingItem(item);
    setFormData({
      name: item.publisherName,
      address: item.address || "",
      phone: item.phone || "",
      website: item.website || "",
      establishedYear: item.establishedYear?.toString() || "",
    });
    setFormOpen(true);
  };

  const handleDelete = async (item: Publisher) => {
    if (
      window.confirm(`Are you sure you want to delete "${item.publisherName}"?`)
    ) {
      try {
        await PublisherService.deletePublisher(item.publisherId);
        setSnackbar({
          open: true,
          message: "Publisher deleted successfully",
          severity: "success",
        });
        // Refresh the first page after deletion
        setCurrentPage(0);
        fetchPublishers(0, searchTerm, true);
      } catch (error) {
        console.error("Error deleting publisher:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete publisher",
          severity: "error",
        });
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Publisher name is required",
        severity: "error",
      });
      return;
    }

    try {
      let success = false;

      if (editingItem) {
        const updateData: PublisherUpdateRequest = {
          publisherId: editingItem.publisherId,
          publisherName: formData.name,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          establishedYear: formData.establishedYear
            ? parseInt(formData.establishedYear)
            : undefined,
        };
        success = await PublisherService.updatePublisher(updateData);

        if (success) {
          setSnackbar({
            open: true,
            message: "Publisher updated successfully",
            severity: "success",
          });
        } else {
          throw new Error("Update failed");
        }
      } else {
        const createData: PublisherCreateRequest = {
          publisherName: formData.name,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          establishedYear: formData.establishedYear
            ? parseInt(formData.establishedYear)
            : undefined,
        };
        await PublisherService.createPublisher(createData);
        setSnackbar({
          open: true,
          message: "Publisher created successfully",
          severity: "success",
        });
      }

      setFormOpen(false);
      // Refresh the first page after create/update
      setCurrentPage(0);
      fetchPublishers(0, searchTerm, true);
    } catch (error) {
      console.error("Error saving publisher:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update publisher"
          : "Failed to create publisher",
        severity: "error",
      });
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      website: "",
      establishedYear: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  return (
    <Box>
      <PublishersTable
        data={publishers}
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
                label="Search Publishers"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by publisher name..."
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
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Publisher" : "Add New Publisher"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Publisher Name - Hàng đầu */}
            <TextField
              autoFocus
              label="Publisher Name *"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
              size="medium"
            />

            {/* Website - 1 hàng */}
            <TextField
              label="Website"
              fullWidth
              variant="outlined"
              value={formData.website}
              onChange={handleInputChange("website")}
              placeholder="https://example.com"
              size="medium"
            />

            {/* Established Year và Phone - 1 hàng */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Established Year"
                fullWidth
                variant="outlined"
                type="number"
                value={formData.establishedYear}
                onChange={handleInputChange("establishedYear")}
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
                size="medium"
              />
              <TextField
                label="Phone"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                size="medium"
              />
            </Box>

            {/* Address - 1 hàng */}
            <TextField
              label="Address"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleInputChange("address")}
              size="medium"
            />
          </Stack>
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
