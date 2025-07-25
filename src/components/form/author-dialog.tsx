"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  InputAdornment,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Author } from "@/types/author";
import { CountryDropdown } from "@/components/form/country-dropdown";

export interface AuthorFormData {
  authorName: string;
  authorBio: string;
  nationality: string;
  genre: string;
}

interface AuthorDialogProps {
  open: boolean;
  author?: Author | null;
  onSubmit: (data: AuthorFormData, photo?: File) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const AuthorDialog: React.FC<AuthorDialogProps> = ({
  open,
  author,
  onSubmit,
  onClose,
  loading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    author?.photoUrl || ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<AuthorFormData>({
    authorName: author?.authorName || "",
    authorBio: author?.authorBio || "",
    nationality: author?.nationality || "",
    genre: author?.genre || "",
  });

  // Reset form when dialog opens/closes or author changes
  React.useEffect(() => {
    if (open) {
      setFormData({
        authorName: author?.authorName || "",
        authorBio: author?.authorBio || "",
        nationality: author?.nationality || "",
        genre: author?.genre || "",
      });
      setPhotoPreview(author?.photoUrl || "");
      setSelectedFile(null);
    }
  }, [open, author]);

  const handleInputChange = (field: keyof AuthorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountryChange = (countryName: string) => {
    setFormData((prev) => ({
      ...prev,
      nationality: countryName,
    }));
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.authorName.trim()) {
      return;
    }

    await onSubmit(formData, selectedFile || undefined);
  };

  const isEditing = !!author;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close Button */}
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              bgcolor: "rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.2)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "#333",
            }}
          >
            {isEditing ? "Edit Author" : "Add New Author"}
          </Typography>

          {/* Profile Photo Upload */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              style={{ display: "none" }}
            />

            <Avatar
              src={photoPreview}
              alt={formData.authorName}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: 100,
                height: 100,
                fontSize: 36,
                bgcolor: "#1976d2",
                border: "4px solid #fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "50%",
                  border: "2px dashed transparent",
                  transition: "border-color 0.2s",
                },
                "&:hover::after": {
                  borderColor: "#1976d2",
                },
              }}
            >
              {!photoPreview && formData.authorName.charAt(0).toUpperCase()}
            </Avatar>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#666",
                cursor: "pointer",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                {selectedFile
                  ? selectedFile.name
                  : "Click avatar to upload photo"}
              </Typography>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Author Name */}
            <TextField
              fullWidth
              placeholder="Author Name"
              value={formData.authorName}
              onChange={(e) => handleInputChange("authorName", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />

            {/* Nationality */}
            <CountryDropdown
              value={formData.nationality}
              onChange={handleCountryChange}
              disabled={loading}
              placeholder="Select nationality"
              label="Nationality"
            />

            {/* Genre */}
            <TextField
              fullWidth
              placeholder="Genre"
              value={formData.genre}
              onChange={(e) => handleInputChange("genre", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />

            {/* Biography */}
            <TextField
              fullWidth
              placeholder="Biography"
              multiline
              rows={2}
              value={formData.authorBio}
              onChange={(e) => handleInputChange("authorBio", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <DescriptionIcon sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                pt: 1,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.authorName.trim()}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  bgcolor: "#000",
                  "&:hover": {
                    bgcolor: "#333",
                  },
                  "&:disabled": {
                    bgcolor: "#ccc",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isEditing ? (
                  "Update Author"
                ) : (
                  "Add Author"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
