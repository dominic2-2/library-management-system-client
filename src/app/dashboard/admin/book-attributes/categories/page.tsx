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
import { CategoriesTable, Category } from "@/components/table/categories-table";
import { CategoryService } from "@/services/category-service";

// Interface to handle both API response formats
interface CategoryApiResponse {
  categoryId?: number;
  category_id?: number;
  categoryName?: string;
  category_name?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await CategoryService.getCategories();
      let dataArray: Category[] = [];

      if (Array.isArray(result)) {
        dataArray = result.map((item: CategoryApiResponse, idx: number) => ({
          category_id: item.categoryId ?? item.category_id ?? idx,
          category_name: item.categoryName ?? item.category_name ?? "",
          description: "Default category description",
          book_count: Math.floor(Math.random() * 50), // Mock data
        }));
      } else if (result && typeof result === "object") {
        const responseObj = result as Record<string, unknown>;
        if (Array.isArray(responseObj.$values)) {
          dataArray = responseObj.$values.map(
            (item: CategoryApiResponse, idx: number) => ({
              category_id: item.categoryId ?? item.category_id ?? idx,
              category_name: item.categoryName ?? item.category_name ?? "",
              description: "Default category description",
              book_count: Math.floor(Math.random() * 50), // Mock data
            })
          );
        } else if (Array.isArray(responseObj.data)) {
          dataArray = responseObj.data.map(
            (item: CategoryApiResponse, idx: number) => ({
              category_id: item.categoryId ?? item.category_id ?? idx,
              category_name: item.categoryName ?? item.category_name ?? "",
              description: "Default category description",
              book_count: Math.floor(Math.random() * 50), // Mock data
            })
          );
        }
      }

      setCategories(dataArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch categories",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    setFormData({ name: item.category_name });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Category name is required",
        severity: "error",
      });
      return;
    }

    try {
      if (editingItem) {
        await CategoryService.updateCategory({
          category_id: editingItem.category_id,
          category_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Category updated successfully",
          severity: "success",
        });
      } else {
        await CategoryService.createCategory({ category_name: formData.name });
        setSnackbar({
          open: true,
          message: "Category created successfully",
          severity: "success",
        });
      }
      setFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update category"
          : "Failed to create category",
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
      <CategoriesTable
        data={categories}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
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
