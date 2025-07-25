"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TablePagination,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Edit,
  Visibility,
  Delete,
  LibraryBooks as EditionIcon,
} from "@mui/icons-material";
import { Edition } from "@/types/edition";

export interface EditionsTableProps {
  data: Edition[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (edition: Edition) => void;
  onDelete?: (edition: Edition) => void;
  onView?: (id: number) => void;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
  searchInput?: React.ReactNode;
  // Infinite scroll props
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  enableInfiniteScroll?: boolean;
}

export const EditionsTable: React.FC<EditionsTableProps> = ({
  data,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  showActions = true,
  searchInput,
  hasNextPage = false,
  onLoadMore,
  loadingMore = false,
  enableInfiniteScroll = true,
}) => {
  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleChangePage = (event: unknown, newPage: number): void => {
    if (onPageChange) {
      onPageChange(event, newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    }
  };

  const handleEdit = (edition: Edition): void => {
    if (onEdit) {
      onEdit(edition);
    }
  };

  const handleDelete = (edition: Edition): void => {
    if (onDelete) {
      onDelete(edition);
    }
  };

  const handleView = (id: number): void => {
    if (onView) {
      onView(id);
    }
  };

  // Infinite scroll logic
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, loadingMore, onLoadMore]);

  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "20px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleLoadMore, enableInfiniteScroll]);

  if (loading && data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(224, 224, 224, 1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditionIcon sx={{ color: "#1976d2" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Editions Management
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={`Total: ${totalCount}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            color="primary"
            onClick={onAdd}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Add Edition
          </Button>
        )}
      </Box>

      {/* Search Input Section */}
      {searchInput && searchInput}

      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: enableInfiniteScroll ? 600 : "none",
          overflowY: enableInfiniteScroll ? "auto" : "visible",
          // Hide scrollbar
          "&::-webkit-scrollbar": {
            display: "none",
          },
          // Hide scrollbar for Firefox
          scrollbarWidth: "none",
          // Ensure scrolling still works
          msOverflowStyle: "none",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Edition Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Books Count
              </TableCell>
              {showActions && (
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 4 : 3} align="center">
                  <Typography color="textSecondary">
                    No editions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((edition) => (
                <TableRow
                  key={edition.editionId}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {edition.editionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {edition.editionName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={edition.bookCount || 0}
                      color={
                        edition.bookCount && edition.bookCount > 0
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {onView && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleView(edition.editionId)}
                              sx={{
                                bgcolor: "#17a2b8",
                                color: "white",
                                "&:hover": {
                                  bgcolor: "#138496",
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit Edition">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(edition)}
                              sx={{
                                bgcolor: "#ff9800",
                                color: "white",
                                "&:hover": {
                                  bgcolor: "#f57c00",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete Edition">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(edition)}
                              sx={{
                                bgcolor: "#f44336",
                                color: "white",
                                "&:hover": {
                                  bgcolor: "#d32f2f",
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}

            {/* Infinite scroll trigger element */}
            {enableInfiniteScroll && hasNextPage && (
              <TableRow ref={loadMoreRef}>
                <TableCell colSpan={showActions ? 4 : 3} align="center">
                  <Box py={2}>
                    {loadingMore ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={1}
                      >
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="textSecondary">
                          Loading more editions...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Scroll down to load more
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* End of data indicator */}
            {enableInfiniteScroll && !hasNextPage && data.length > 0 && (
              <TableRow>
                <TableCell colSpan={showActions ? 4 : 3} align="center">
                  <Box py={2}>
                    <Typography variant="body2" color="textSecondary">
                      No more editions to load
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Traditional pagination - hidden when infinite scroll is enabled */}
      {!enableInfiniteScroll && onPageChange && onRowsPerPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
          }}
        />
      )}
    </Paper>
  );
};
