"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  CoverTypesTable,
  CoverType,
} from "@/components/table/cover-types-table";
import { CoverTypeService } from "@/services/cover-type-service";

export default function CoverTypesPage() {
  const [coverTypes, setCoverTypes] = useState<CoverType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CoverType | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchCoverTypes = async () => {
    setLoading(true);
    try {
      const result = await CoverTypeService.getCoverTypes();
      let dataArray: CoverType[] = [];

      // Create interface for API response format
      interface CoverTypeApiResponse {
        coverTypeId?: number;
        cover_type_id?: number;
        coverTypeName?: string;
        cover_type_name?: string;
      }

      if (Array.isArray(result)) {
        dataArray = result.map((item: CoverTypeApiResponse, idx: number) => ({
          cover_type_id: item.coverTypeId ?? item.cover_type_id ?? idx,
          cover_type_name: item.coverTypeName ?? item.cover_type_name ?? "",
          description: "High-quality cover type",
          durability_rating: Math.floor(Math.random() * 5) + 6, // 6-10 rating
          cost_factor: Math.random() * 2 + 1, // 1-3x cost factor
          book_count: Math.floor(Math.random() * 75),
        }));
      } else if (result && typeof result === "object") {
        const responseObj = result as Record<string, unknown>;
        if (Array.isArray(responseObj.$values)) {
          dataArray = responseObj.$values.map(
            (item: CoverTypeApiResponse, idx: number) => ({
              cover_type_id: item.coverTypeId ?? item.cover_type_id ?? idx,
              cover_type_name: item.coverTypeName ?? item.cover_type_name ?? "",
              description: "High-quality cover type",
              durability_rating: Math.floor(Math.random() * 5) + 6,
              cost_factor: Math.random() * 2 + 1,
              book_count: Math.floor(Math.random() * 75),
            })
          );
        } else if (Array.isArray(responseObj.data)) {
          dataArray = responseObj.data.map(
            (item: CoverTypeApiResponse, idx: number) => ({
              cover_type_id: item.coverTypeId ?? item.cover_type_id ?? idx,
              cover_type_name: item.coverTypeName ?? item.cover_type_name ?? "",
              description: "High-quality cover type",
              durability_rating: Math.floor(Math.random() * 5) + 6,
              cost_factor: Math.random() * 2 + 1,
              book_count: Math.floor(Math.random() * 75),
            })
          );
        }
      }

      setCoverTypes(dataArray);
    } catch (error) {
      console.error("Error fetching cover types:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch cover types",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverTypes();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: CoverType) => {
    setEditingItem(item);
    setFormData({ name: item.cover_type_name });
    setFormOpen(true);
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
      if (editingItem) {
        await CoverTypeService.updateCoverType({
          cover_type_id: editingItem.cover_type_id,
          cover_type_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Cover type updated successfully",
          severity: "success",
        });
      } else {
        await CoverTypeService.createCoverType({
          cover_type_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Cover type created successfully",
          severity: "success",
        });
      }
      setFormOpen(false);
      fetchCoverTypes();
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
        onAdd={handleAdd}
        onEdit={handleEdit}
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
