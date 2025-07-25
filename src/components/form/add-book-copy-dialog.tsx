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
  Avatar,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Close, Search as SearchIcon } from "@mui/icons-material";
import toast from "react-hot-toast";
import { bookCopyService } from "@/services/book-copy.service";
import { PublisherService } from "@/services/publisher-service";
import { EditionService } from "@/services/edition-service";
import { CoverTypeService } from "@/services/cover-type-service";
import { PaperQualityService } from "@/services/paper-quality-service";
import { BookVolumeForCopy, CreateBookCopyRequest } from "@/types/book-copy";
import { Publisher } from "@/types/publisher";
import { Edition } from "@/types/edition";
import { CoverType } from "@/types/CoverType";
import { PaperQuality } from "@/types/paper-quality";

interface AddBookCopyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (copyData: CreateBookCopyRequest) => void;
  loading?: boolean;
}

const COPY_STATUS_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Borrowed", label: "Borrowed" },
  { value: "Reserved", label: "Reserved" },
  { value: "Lost", label: "Lost" },
  { value: "Damaged", label: "Damaged" },
];

// Generate years from current year to 1900
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: currentYear - 1899 },
  (_, i) => currentYear - i
);

export const AddBookCopyDialog: React.FC<AddBookCopyDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateBookCopyRequest>({
    volumeId: 0,
    publisherId: undefined,
    editionId: undefined,
    publicationYear: undefined,
    coverTypeId: undefined,
    paperQualityId: undefined,
    notes: "",
    copyStatus: "Available",
    location: "",
  });

  const [volumes, setVolumes] = useState<BookVolumeForCopy[]>([]);
  const [selectedVolume, setSelectedVolume] =
    useState<BookVolumeForCopy | null>(null);
  const [volumeSearch, setVolumeSearch] = useState("");
  const [volumesLoading, setVolumesLoading] = useState(false);

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [coverTypes, setCoverTypes] = useState<CoverType[]>([]);
  const [paperQualities, setPaperQualities] = useState<PaperQuality[]>([]);

  const [floor, setFloor] = useState("");
  const [shelf, setShelf] = useState("");

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [
          publishersData,
          editionsData,
          coverTypesData,
          paperQualitiesData,
        ] = await Promise.all([
          PublisherService.getPublishers(),
          EditionService.getEditions(),
          CoverTypeService.getCoverTypes(),
          PaperQualityService.getPaperQualities(),
        ]);

        setPublishers(publishersData);
        setEditions(editionsData);
        setCoverTypes(coverTypesData);
        setPaperQualities(paperQualitiesData);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("❌ Không thể tải dữ liệu dropdown", {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
          },
        });
      }
    };

    if (open) {
      loadDropdownData();
    }
  }, [open]);

  // Load volumes when search changes
  useEffect(() => {
    const loadVolumes = async () => {
      setVolumesLoading(true);
      try {
        const volumesData = await bookCopyService.getBookVolumesForCopy(
          volumeSearch
        );
        setVolumes(volumesData);
      } catch (error) {
        console.error("Error loading volumes:", error);
        toast.error("❌ Không thể tải danh sách tập sách", {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            padding: "16px 20px",
            borderRadius: "12px",
          },
        });
      } finally {
        setVolumesLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadVolumes();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [volumeSearch]);

  // Update location when floor/shelf changes
  useEffect(() => {
    if (floor && shelf) {
      setFormData((prev) => ({
        ...prev,
        location: `Tầng ${floor} - Kệ ${shelf}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        location: "",
      }));
    }
  }, [floor, shelf]);

  const handleVolumeSelect = (volume: BookVolumeForCopy | null) => {
    setSelectedVolume(volume);
    setFormData((prev) => ({
      ...prev,
      volumeId: volume?.volumeId || 0,
    }));
  };

  const handleInputChange = (
    field: keyof CreateBookCopyRequest,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFloorChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setFloor(value);
    }
  };

  const handleShelfChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setShelf(value);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedVolume) {
      toast.error("⚠️ Vui lòng chọn tập sách", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#F59E0B",
        },
      });
      return false;
    }

    if (!formData.publisherId) {
      toast.error("⚠️ Vui lòng chọn nhà xuất bản", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    if (!formData.editionId) {
      toast.error("⚠️ Vui lòng chọn phiên bản", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    if (!formData.publicationYear) {
      toast.error("⚠️ Vui lòng chọn năm xuất bản", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    if (!formData.coverTypeId) {
      toast.error("⚠️ Vui lòng chọn loại bìa", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    if (!formData.paperQualityId) {
      toast.error("⚠️ Vui lòng chọn chất lượng giấy", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    if (!floor || !shelf) {
      toast.error("⚠️ Vui lòng nhập đầy đủ thông tin vị trí (Tầng và Kệ)", {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          padding: "16px 20px",
          borderRadius: "12px",
        },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      volumeId: 0,
      publisherId: undefined,
      editionId: undefined,
      publicationYear: undefined,
      coverTypeId: undefined,
      paperQualityId: undefined,
      notes: "",
      copyStatus: "Available",
      location: "",
    });
    setSelectedVolume(null);
    setVolumeSearch("");
    setFloor("");
    setShelf("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thêm bản sao sách</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Volume Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Chọn tập sách <span style={{ color: "red" }}>*</span>
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên sách..."
              value={volumeSearch}
              onChange={(e) => setVolumeSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />

            {/* Volume List */}
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {volumesLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : volumes.length === 0 ? (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  Không tìm thấy tập sách nào
                </Typography>
              ) : (
                volumes.map((volume) => (
                  <Card
                    key={volume.volumeId}
                    sx={{
                      mb: 1,
                      cursor: "pointer",
                      border:
                        selectedVolume?.volumeId === volume.volumeId ? 2 : 1,
                      borderColor:
                        selectedVolume?.volumeId === volume.volumeId
                          ? "primary.main"
                          : "divider",
                      "&:hover": {
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleVolumeSelect(volume)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                          <Box display="flex" alignItems="center">
                            {volume.coverImg && (
                              <Avatar
                                src={volume.coverImg}
                                alt={volume.title}
                                sx={{ width: 40, height: 40, mr: 2 }}
                                variant="rounded"
                              />
                            )}
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {volume.title}
                              </Typography>
                              {volume.author && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Tác giả: {volume.author}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography variant="h6" color="primary">
                            Tập {volume.volumeNumber}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>

          {/* Form Fields */}
          <Grid container spacing={2}>
            {/* Publisher */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Nhà xuất bản *</InputLabel>
                <Select
                  value={formData.publisherId || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "publisherId",
                      e.target.value || undefined
                    )
                  }
                >
                  <MenuItem value="">
                    <em>Chọn nhà xuất bản</em>
                  </MenuItem>
                  {publishers.map((publisher) => (
                    <MenuItem
                      key={publisher.publisherId}
                      value={publisher.publisherId}
                    >
                      {publisher.publisherName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Edition */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Phiên bản *</InputLabel>
                <Select
                  value={formData.editionId || ""}
                  onChange={(e) =>
                    handleInputChange("editionId", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">
                    <em>Chọn phiên bản</em>
                  </MenuItem>
                  {editions.map((edition) => (
                    <MenuItem key={edition.editionId} value={edition.editionId}>
                      {edition.editionName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Publication Year */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Năm xuất bản *</InputLabel>
                <Select
                  value={formData.publicationYear || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "publicationYear",
                      e.target.value || undefined
                    )
                  }
                >
                  <MenuItem value="">
                    <em>Chọn năm xuất bản</em>
                  </MenuItem>
                  {YEAR_OPTIONS.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Cover Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại bìa *</InputLabel>
                <Select
                  value={formData.coverTypeId || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "coverTypeId",
                      e.target.value || undefined
                    )
                  }
                >
                  <MenuItem value="">
                    <em>Chọn loại bìa</em>
                  </MenuItem>
                  {coverTypes.map((coverType) => (
                    <MenuItem
                      key={coverType.coverTypeId}
                      value={coverType.coverTypeId}
                    >
                      {coverType.coverTypeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Paper Quality */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Chất lượng giấy *</InputLabel>
                <Select
                  value={formData.paperQualityId || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "paperQualityId",
                      e.target.value || undefined
                    )
                  }
                >
                  <MenuItem value="">
                    <em>Chọn chất lượng giấy</em>
                  </MenuItem>
                  {paperQualities.map((paperQuality) => (
                    <MenuItem
                      key={paperQuality.paperQualityId}
                      value={paperQuality.paperQualityId}
                    >
                      {paperQuality.paperQualityName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Copy Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Trạng thái *</InputLabel>
                <Select
                  value={formData.copyStatus}
                  onChange={(e) =>
                    handleInputChange("copyStatus", e.target.value)
                  }
                >
                  {COPY_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Vị trí <span style={{ color: "red" }}>*</span>
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  label="Tầng *"
                  value={floor}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  placeholder="1"
                  required
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Kệ *"
                  value={shelf}
                  onChange={(e) => handleShelfChange(e.target.value)}
                  placeholder="1"
                  required
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  sx={{ flex: 1 }}
                />
              </Box>
              {formData.location && (
                <Typography variant="caption" color="text.secondary">
                  Vị trí: {formData.location}
                </Typography>
              )}
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                multiline
                rows={3}
                helperText="Trường này không bắt buộc"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? "Đang tạo..." : "Thêm bản sao"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
