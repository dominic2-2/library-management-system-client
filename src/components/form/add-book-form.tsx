"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Avatar,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Close, PhotoCamera as PhotoCameraIcon } from "@mui/icons-material";
import { CategoryService } from "@/services/category-service";
import { AuthorService } from "@/services/author-service";
import { Category } from "@/types/category";
import { Author } from "@/types/author";

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookData: BookFormData, coverImage?: File) => void;
  loading?: boolean;
}

interface BookFormData {
  title: string;
  language: string;
  bookStatus: string;
  description: string;
  categoryId: number;
  authorIds: number[];
}

export const AddBookForm: React.FC<AddBookFormProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    language: "Việt",
    bookStatus: "Active",
    description: "",
    categoryId: 0,
    authorIds: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);

  // Fetch categories and authors when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          // Fetch categories
          setCategoriesLoading(true);
          const categoriesData = await CategoryService.getCategories();
          const validCategories = Array.isArray(categoriesData)
            ? categoriesData
            : [];
          setCategories(validCategories);

          if (validCategories.length > 0 && formData.categoryId === 0) {
            setFormData((prev) => ({
              ...prev,
              categoryId: validCategories[0].categoryId,
            }));
          }

          // Fetch authors
          setAuthorsLoading(true);
          const authorsData = await AuthorService.getAuthors();
          setAuthors(Array.isArray(authorsData) ? authorsData : []);
        } catch (error) {
          console.error("Error fetching data:", error);
          setCategories([]);
          setAuthors([]);
        } finally {
          setCategoriesLoading(false);
          setAuthorsLoading(false);
        }
      };

      fetchData();
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

    if (selectedAuthors.length === 0) {
      alert("Vui lòng chọn ít nhất một tác giả");
      return;
    }

    onSubmit(formData, selectedImage || undefined);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      language: "Việt",
      bookStatus: "Active",
      description: "",
      categoryId: categories.length > 0 ? categories[0].categoryId : 0,
      authorIds: [],
    });
    setSelectedAuthors([]);
    setImagePreview("");
    setSelectedImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
          {/* Main Layout: Image on left, All Info on right */}
          <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
            {/* Book Cover Image Upload - Left Side */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "250px",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Ảnh Bìa Sách
              </Typography>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: "none" }}
              />

              <Avatar
                src={imagePreview}
                alt={formData.title}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 200,
                  height: 260,
                  borderRadius: 2,
                  fontSize: 36,
                  bgcolor: "#f5f5f5",
                  border: "2px dashed #ccc",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    borderColor: "#1976d2",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!imagePreview && (
                  <Box sx={{ textAlign: "center" }}>
                    <PhotoCameraIcon
                      sx={{ fontSize: 32, color: "#999", mb: 1 }}
                    />
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      Thêm ảnh
                    </Typography>
                  </Box>
                )}
              </Avatar>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoCameraIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  {selectedImage ? selectedImage.name : "Click để upload ảnh"}
                </Typography>
              </Box>
            </Box>

            {/* All Book Information - Right Side */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Thông Tin Sách
              </Typography>

              {/* Basic Book Information */}
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
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.categoryName}
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
                    <MenuItem value="Trung">Tiếng Trung</MenuItem>
                    <MenuItem value="Nhật">Tiếng Nhật</MenuItem>
                    <MenuItem value="Hàn">Tiếng Hàn</MenuItem>
                    <MenuItem value="Pháp">Tiếng Pháp</MenuItem>
                    <MenuItem value="Đức">Tiếng Đức</MenuItem>
                    <MenuItem value="Tây Ban Nha">Tiếng Tây Ban Nha</MenuItem>
                    <MenuItem value="Ý">Tiếng Ý</MenuItem>
                    <MenuItem value="Nga">Tiếng Nga</MenuItem>
                    <MenuItem value="Thái">Tiếng Thái</MenuItem>
                    <MenuItem value="Khác">Ngôn ngữ khác</MenuItem>
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
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />

              {/* Authors Selection with Search */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Tác Giả
                </Typography>
                <Autocomplete
                  multiple
                  options={authors}
                  value={selectedAuthors}
                  onChange={(_, newValue) => {
                    setSelectedAuthors(newValue);
                    setFormData((prev) => ({
                      ...prev,
                      authorIds: newValue.map((author) => author.authorId),
                    }));
                  }}
                  getOptionLabel={(option) => option.authorName}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(
                      (option) =>
                        option.authorName
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()) ||
                        (option.nationality &&
                          option.nationality
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()))
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tìm kiếm và chọn tác giả *"
                      placeholder={
                        selectedAuthors.length === 0
                          ? "Nhập tên tác giả để tìm kiếm..."
                          : "Thêm tác giả khác..."
                      }
                      disabled={authorsLoading}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: authorsLoading ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : (
                          params.InputProps.startAdornment
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.authorName}
                        </Typography>
                        {option.nationality && (
                          <Typography variant="caption" color="textSecondary">
                            {option.nationality}
                            {option.genre && ` • ${option.genre}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.authorName}
                        {...getTagProps({ index })}
                        key={option.authorId}
                        variant="outlined"
                        size="small"
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          borderColor: "#1976d2",
                        }}
                      />
                    ))
                  }
                  disabled={authorsLoading}
                  loading={authorsLoading}
                  loadingText="Đang tải tác giả..."
                  noOptionsText="Không tìm thấy tác giả nào"
                  sx={{ width: "100%" }}
                />
              </Box>
            </Box>
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
          disabled={
            loading ||
            categoriesLoading ||
            authorsLoading ||
            formData.categoryId === 0 ||
            selectedAuthors.length === 0
          }
          sx={{ bgcolor: "#2c5aa0", "&:hover": { bgcolor: "#1e3f6b" } }}
        >
          {loading ? "Đang thêm..." : "Thêm sách"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
