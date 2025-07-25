"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  BookCopy,
  UpdateBookCopyRequest,
  DropdownOptionWithId,
} from "../../types/book-copy";
import { bookCopyService } from "../../services/book-copy.service";

interface EditBookCopyDialogProps {
  open: boolean;
  bookCopy: BookCopy | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditBookCopyDialog: React.FC<EditBookCopyDialogProps> = ({
  open,
  bookCopy,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    coverTypeId: "",
    paperQualityId: "",
    editionId: "",
    location: "",
    copyStatus: "",
  });

  const [originalData, setOriginalData] = useState({
    coverTypeId: "",
    paperQualityId: "",
    editionId: "",
    location: "",
    copyStatus: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState<{
    editions: DropdownOptionWithId[];
    coverTypes: DropdownOptionWithId[];
    paperQualities: DropdownOptionWithId[];
  }>({
    editions: [],
    coverTypes: [],
    paperQualities: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dropdown options
  useEffect(() => {
    if (open) {
      loadDropdownOptions();
    }
  }, [open]);

  // Set form data when bookCopy changes
  useEffect(() => {
    if (bookCopy && dropdownOptions.editions.length > 0) {
      setFormDataFromBookCopy(bookCopy);
    }
  }, [bookCopy, dropdownOptions]);

  const loadDropdownOptions = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [editions, coverTypes, paperQualities] = await Promise.all([
        bookCopyService.getEditDropdownOptions.getEditions(),
        bookCopyService.getEditDropdownOptions.getCoverTypes(),
        bookCopyService.getEditDropdownOptions.getPaperQualities(),
      ]);

      setDropdownOptions({
        editions,
        coverTypes,
        paperQualities,
      });
    } catch (err) {
      setError("Không thể tải dữ liệu dropdown");
      console.error("Error loading dropdown options:", err);
    } finally {
      setLoading(false);
    }
  };

  const setFormDataFromBookCopy = (copy: BookCopy): void => {
    // Find IDs based on names
    const editionId =
      dropdownOptions.editions.find((e) => e.value === copy.editionName)?.id ||
      "";
    const coverTypeId =
      dropdownOptions.coverTypes.find((c) => c.value === copy.coverTypeName)
        ?.id || "";
    const paperQualityId =
      dropdownOptions.paperQualities.find(
        (p) => p.value === copy.paperQualityName
      )?.id || "";

    const data = {
      editionId: editionId.toString(),
      coverTypeId: coverTypeId.toString(),
      paperQualityId: paperQualityId.toString(),
      location: copy.location,
      copyStatus: copy.copyStatus,
    };

    setFormData(data);
    setOriginalData(data);
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getChangedFields = (): UpdateBookCopyRequest => {
    const changes: UpdateBookCopyRequest = {};

    if (formData.editionId !== originalData.editionId && formData.editionId) {
      changes.editionId = parseInt(formData.editionId);
    }

    if (
      formData.coverTypeId !== originalData.coverTypeId &&
      formData.coverTypeId
    ) {
      changes.coverTypeId = parseInt(formData.coverTypeId);
    }

    if (
      formData.paperQualityId !== originalData.paperQualityId &&
      formData.paperQualityId
    ) {
      changes.paperQualityId = parseInt(formData.paperQualityId);
    }

    if (formData.location !== originalData.location) {
      changes.location = formData.location;
    }

    if (formData.copyStatus !== originalData.copyStatus) {
      changes.copyStatus = formData.copyStatus;
    }

    return changes;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!bookCopy) return;

    setSubmitting(true);
    setError(null);

    try {
      const changes = getChangedFields();

      // Check if there are any changes
      if (Object.keys(changes).length === 0) {
        setError("Không có thay đổi nào để lưu");
        setSubmitting(false);
        return;
      }

      await bookCopyService.updateBookCopy(bookCopy.copyId, changes);
      onSuccess();
      handleClose();
    } catch (err) {
      setError("Không thể cập nhật bản sao. Vui lòng thử lại.");
      console.error("Error updating book copy:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (): void => {
    setFormData({
      coverTypeId: "",
      paperQualityId: "",
      editionId: "",
      location: "",
      copyStatus: "",
    });
    setOriginalData({
      coverTypeId: "",
      paperQualityId: "",
      editionId: "",
      location: "",
      copyStatus: "",
    });
    setError(null);
    setSubmitting(false);
    onClose();
  };

  const hasChanges = (): boolean => {
    return Object.keys(getChangedFields()).length > 0;
  };

  if (!bookCopy) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Chỉnh sửa bản sao
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mã vạch: {bookCopy.barcode} • {bookCopy.bookTitle}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Đang tải dữ liệu...
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Edition */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Phiên bản</InputLabel>
                <Select
                  value={formData.editionId}
                  onChange={(e) =>
                    handleInputChange("editionId", e.target.value)
                  }
                  label="Phiên bản"
                  disabled={submitting}
                >
                  {dropdownOptions.editions.map((option) => (
                    <MenuItem key={option.id} value={option.id.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Cover Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại bìa</InputLabel>
                <Select
                  value={formData.coverTypeId}
                  onChange={(e) =>
                    handleInputChange("coverTypeId", e.target.value)
                  }
                  label="Loại bìa"
                  disabled={submitting}
                >
                  {dropdownOptions.coverTypes.map((option) => (
                    <MenuItem key={option.id} value={option.id.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Paper Quality */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chất lượng giấy</InputLabel>
                <Select
                  value={formData.paperQualityId}
                  onChange={(e) =>
                    handleInputChange("paperQualityId", e.target.value)
                  }
                  label="Chất lượng giấy"
                  disabled={submitting}
                >
                  {dropdownOptions.paperQualities.map((option) => (
                    <MenuItem key={option.id} value={option.id.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Copy Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.copyStatus}
                  onChange={(e) =>
                    handleInputChange("copyStatus", e.target.value)
                  }
                  label="Trạng thái"
                  disabled={submitting}
                >
                  <MenuItem value="Available">Có sẵn</MenuItem>
                  <MenuItem value="Borrowed">Đã mượn</MenuItem>
                  <MenuItem value="Reserved">Đã đặt</MenuItem>
                  <MenuItem value="Lost">Mất</MenuItem>
                  <MenuItem value="Damaged">Hỏng</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vị trí"
                placeholder="Ví dụ: Tầng 2, Kệ 3, Ngăn A"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                disabled={submitting}
                helperText="Nhập vị trí cụ thể của bản sao trong thư viện"
              />
            </Grid>

            {/* Changes indicator */}
            {hasChanges() && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Có thay đổi chưa được lưu. Nhấn "Cập nhật" để lưu các thay
                  đổi.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading || !hasChanges()}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
