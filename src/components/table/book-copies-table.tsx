"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  BookCopy,
  BookCopyFilter,
  DropdownOption,
} from "../../types/book-copy";
import { useBookCopyList } from "../../hooks/useBookCopyList";
import { bookCopyService } from "../../services/book-copy.service";
import { EditBookCopyDialog } from "../form/edit-book-copy-dialog";

interface BookCopiesTableProps {
  onCopySelect?: (copy: BookCopy) => void;
}

const getStatusColor = (
  status: string
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status.toLowerCase()) {
    case "available":
      return "success";
    case "borrowed":
      return "warning";
    case "reserved":
      return "info";
    case "lost":
    case "damaged":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status.toLowerCase()) {
    case "available":
      return "Có sẵn";
    case "borrowed":
      return "Đã mượn";
    case "reserved":
      return "Đã đặt";
    case "lost":
      return "Mất";
    case "damaged":
      return "Hỏng";
    default:
      return status;
  }
};

export const BookCopiesTable: React.FC<BookCopiesTableProps> = ({
  onCopySelect,
}) => {
  const {
    bookCopies,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    filters,
    setFilters,
  } = useBookCopyList();

  const [localFilters, setLocalFilters] = useState<BookCopyFilter>(filters);
  const [dropdownOptions, setDropdownOptions] = useState<{
    categories: DropdownOption[];
    authors: DropdownOption[];
    publishers: DropdownOption[];
    editions: DropdownOption[];
    coverTypes: DropdownOption[];
    paperQualities: DropdownOption[];
  }>({
    categories: [],
    authors: [],
    publishers: [],
    editions: [],
    coverTypes: [],
    paperQualities: [],
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Load dropdown options on component mount
  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        const [
          categories,
          authors,
          publishers,
          editions,
          coverTypes,
          paperQualities,
        ] = await Promise.all([
          bookCopyService.getFilterOptions.getCategories(),
          bookCopyService.getFilterOptions.getAuthors(),
          bookCopyService.getFilterOptions.getPublishers(),
          bookCopyService.getFilterOptions.getEditions(),
          bookCopyService.getFilterOptions.getCoverTypes(),
          bookCopyService.getFilterOptions.getPaperQualities(),
        ]);

        setDropdownOptions({
          categories,
          authors,
          publishers,
          editions,
          coverTypes,
          paperQualities,
        });
      } catch (error) {
        console.error("Error loading dropdown options:", error);
      }
    };

    loadDropdownOptions();
  }, []);

  // Infinite scroll observer
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [observerCallback]);

  const handleSearch = (): void => {
    setFilters(localFilters);
  };

  const handleRefresh = (): void => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters); // Clear filters state in hook
    setFiltersExpanded(false);
    // refresh() will be called automatically by setFilters
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditClick = (copy: BookCopy, event: React.MouseEvent): void => {
    event.stopPropagation(); // Prevent row click
    setSelectedCopy(copy);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (): void => {
    setEditDialogOpen(false);
    setSelectedCopy(null);
  };

  const handleEditSuccess = (): void => {
    // Refresh the data after successful edit
    handleRefresh();
  };

  const renderTableSkeleton = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={80} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={40} height={24} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ mb: 3 }}>
        <Accordion
          expanded={filtersExpanded}
          onChange={() => setFiltersExpanded(!filtersExpanded)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon />
              <Typography variant="h6">Bộ lọc tìm kiếm</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Basic Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm"
                  placeholder="Tên sách, ISBN..."
                  value={localFilters.search || ""}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, search: e.target.value })
                  }
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={localFilters.copyStatus || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        copyStatus: e.target.value,
                      })
                    }
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="Available">Có sẵn</MenuItem>
                    <MenuItem value="Borrowed">Đã mượn</MenuItem>
                    <MenuItem value="Reserved">Đã đặt</MenuItem>
                    <MenuItem value="Lost">Mất</MenuItem>
                    <MenuItem value="Damaged">Hỏng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Publication Year */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Năm xuất bản</InputLabel>
                  <Select
                    value={localFilters.publicationYear || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        publicationYear: e.target.value
                          ? parseInt(e.target.value.toString())
                          : undefined,
                      })
                    }
                    label="Năm xuất bản"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {Array.from(
                      { length: 30 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location - Floor */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Tầng"
                  type="number"
                  placeholder="1, 2, 3..."
                  value={localFilters.floor || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho phép số nguyên dương
                    if (value === "" || /^[1-9]\d*$/.test(value)) {
                      setLocalFilters({
                        ...localFilters,
                        floor: value ? parseInt(value) : undefined,
                      });
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                />
              </Grid>

              {/* Location - Shelf */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Kệ"
                  type="number"
                  placeholder="1, 2, 3..."
                  value={localFilters.shelf || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho phép số nguyên dương
                    if (value === "" || /^[1-9]\d*$/.test(value)) {
                      setLocalFilters({
                        ...localFilters,
                        shelf: value ? parseInt(value) : undefined,
                      });
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={localFilters.categoryName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        categoryName: e.target.value,
                      })
                    }
                    label="Danh mục"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.categories.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Author */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tác giả</InputLabel>
                  <Select
                    value={localFilters.authorName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        authorName: e.target.value,
                      })
                    }
                    label="Tác giả"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.authors.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Publisher */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Nhà xuất bản</InputLabel>
                  <Select
                    value={localFilters.publisherName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        publisherName: e.target.value,
                      })
                    }
                    label="Nhà xuất bản"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.publishers.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Edition */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Phiên bản</InputLabel>
                  <Select
                    value={localFilters.editionName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        editionName: e.target.value,
                      })
                    }
                    label="Phiên bản"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.editions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Cover Type */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Loại bìa</InputLabel>
                  <Select
                    value={localFilters.coverTypeName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        coverTypeName: e.target.value,
                      })
                    }
                    label="Loại bìa"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.coverTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Paper Quality */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Chất lượng giấy</InputLabel>
                  <Select
                    value={localFilters.paperQualityName || ""}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        paperQualityName: e.target.value,
                      })
                    }
                    label="Chất lượng giấy"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {dropdownOptions.paperQualities.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    Tìm kiếm
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRefresh}
                    startIcon={<RefreshIcon />}
                  >
                    Làm mới
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Results Summary */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Hiển thị {bookCopies.length} / {totalCount} bản sao
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Mã vạch</TableCell>
              <TableCell>Tên sách</TableCell>
              <TableCell>Tập</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>NXB</TableCell>
              <TableCell>Năm XB</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>

          {loading && bookCopies.length === 0 ? (
            renderTableSkeleton()
          ) : (
            <TableBody>
              {bookCopies.map((copy) => (
                <TableRow
                  key={copy.copyId}
                  hover
                  onClick={() => onCopySelect?.(copy)}
                  sx={{ cursor: onCopySelect ? "pointer" : "default" }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {copy.barcode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {copy.bookTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {copy.editionName} • {copy.coverTypeName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="primary"
                    >
                      Tập {copy.volumn}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(copy.copyStatus)}
                      color={getStatusColor(copy.copyStatus)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{copy.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {copy.authorNames.$values.join(", ")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{copy.categoryName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {copy.publisherName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {copy.publicationYear}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {copy.isbn}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={(e) => handleEditClick(copy, e)}
                      sx={{ minWidth: "auto" }}
                    >
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

        {/* Loading More Indicator */}
        {loading && bookCopies.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Đang tải...
            </Typography>
          </Box>
        )}

        {/* No More Data */}
        {!hasMore && bookCopies.length > 0 && (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Đã tải tất cả dữ liệu
            </Typography>
          </Box>
        )}

        {/* No Data */}
        {!loading && bookCopies.length === 0 && (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không tìm thấy bản sao nào
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} style={{ height: 1 }} />

      {/* Edit Dialog */}
      <EditBookCopyDialog
        open={editDialogOpen}
        bookCopy={selectedCopy}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
};
