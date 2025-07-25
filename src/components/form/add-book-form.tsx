"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close, Add, Delete } from "@mui/icons-material";
import { CategoryService } from "@/services/category-service";
import { Category } from "@/types/book";

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookData: BookFormData) => void;
  loading?: boolean;
}

interface BookFormData {
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  categoryId: number;
  authors: { authorName: string; bio?: string }[];
}

export const AddBookForm: React.FC<AddBookFormProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    language: "Việt",
    bookStatus: "Active",
    description: "",
    categoryId: 0, // Will be set to first category when loaded
    authors: [{ authorName: "", bio: "" }],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        try {
          setCategoriesLoading(true);
          const categoriesData = await CategoryService.getCategories();

          // Ensure we have a valid array
          const validCategories = Array.isArray(categoriesData)
            ? categoriesData
            : [];
          setCategories(validCategories);

          // Set default category to first one if available and no category selected
          if (validCategories.length > 0 && formData.categoryId === 0) {
            setFormData((prev) => ({
              ...prev,
              categoryId: validCategories[0].category_id,
            }));
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          // Ensure categories is set to empty array on error
          setCategories([]);
        } finally {
          setCategoriesLoading(false);
        }
      };

      fetchCategories();
    }
  }, [open, formData.categoryId]);

  const handleInputChange = (
    field: keyof BookFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAuthorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.map((author, i) =>
        i === index ? { ...author, [field]: value } : author
      ),
    }));
  };

  const addAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      authors: [...prev.authors, { authorName: "", bio: "" }],
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      setFormData((prev) => ({
        ...prev,
        authors: prev.authors.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên sách");
      return;
    }

    if (formData.categoryId === 0) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    if (!formData.authors.some((author) => author.authorName.trim())) {
      alert("Vui lòng nhập ít nhất một tác giả");
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      language: "Việt",
      bookStatus: "Active",
      description: "",
      categoryId: categories.length > 0 ? categories[0].category_id : 0,
      authors: [{ authorName: "", bio: "" }],
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thêm Sách Mới</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Basic Book Information */}
          <Typography variant="h6" gutterBottom>
            Thông Tin Cơ Bản
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tên sách *"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Danh mục *</InputLabel>
                <Select
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    handleInputChange("categoryId", Number(e.target.value))
                  }
                  label="Danh mục *"
                  required
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang tải...
                    </MenuItem>
                  ) : Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Không có danh mục nào</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Ngôn ngữ</InputLabel>
                <Select
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  label="Ngôn ngữ"
                >
                  <MenuItem value="Việt">Tiếng Việt</MenuItem>
                  <MenuItem value="Anh">Tiếng Anh</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.bookStatus}
                  onChange={(e) =>
                    handleInputChange("bookStatus", e.target.value)
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="Active">Hoạt động</MenuItem>
                  <MenuItem value="Inactive">Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              multiline
              rows={3}
            />
          </Box>

          {/* Authors */}
          <Box sx={{ mt: 4 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Tác Giả</Typography>
              <Button
                startIcon={<Add />}
                onClick={addAuthor}
                variant="outlined"
                size="small"
              >
                Thêm tác giả
              </Button>
            </Box>
            {formData.authors.map((author, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle2">
                    Tác giả {index + 1}
                  </Typography>
                  {formData.authors.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removeAuthor(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Tên tác giả *"
                    value={author.authorName}
                    onChange={(e) =>
                      handleAuthorChange(index, "authorName", e.target.value)
                    }
                    required
                  />
                  <TextField
                    fullWidth
                    label="Tiểu sử"
                    value={author.bio || ""}
                    onChange={(e) =>
                      handleAuthorChange(index, "bio", e.target.value)
                    }
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || categoriesLoading || formData.categoryId === 0}
          sx={{ bgcolor: "#2c5aa0", "&:hover": { bgcolor: "#1e3f6b" } }}
        >
          {loading ? "Đang thêm..." : "Thêm sách"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
