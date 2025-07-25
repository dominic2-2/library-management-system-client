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
  Avatar,
} from "@mui/material";
import {
  Edit,
  Visibility,
  Delete,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Author } from "@/types/author";

export interface AuthorsTableProps {
  data: Author[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
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

export const AuthorsTable: React.FC<AuthorsTableProps> = ({
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

  const handleEdit = (author: Author): void => {
    if (onEdit) {
      onEdit(author);
    }
  };

  const handleDelete = (author: Author): void => {
    if (onDelete) {
      onDelete(author);
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
          <PersonIcon sx={{ color: "#1976d2" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Authors Management
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
            Add Author
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
                Photo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Author Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Bio
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Nationality
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Genre
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
                <TableCell colSpan={showActions ? 8 : 7} align="center">
                  <Typography color="textSecondary">
                    No authors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((author) => (
                <TableRow
                  key={author.authorId}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {author.authorId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={author.photoUrl}
                      alt={author.authorName}
                      sx={{ width: 40, height: 40 }}
                    >
                      {author.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {author.authorName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {author.authorBio || "No bio available"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={author.nationality || "Unknown"}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={author.genre || "Unknown"}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={author.bookCount || 0}
                      color={
                        author.bookCount && author.bookCount > 0
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
                              onClick={() => handleView(author.authorId)}
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
                          <Tooltip title="Edit Author">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(author)}
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
                          <Tooltip title="Delete Author">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(author)}
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
                <TableCell colSpan={showActions ? 8 : 7} align="center">
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
                          Loading more authors...
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
                <TableCell colSpan={showActions ? 8 : 7} align="center">
                  <Box py={2}>
                    <Typography variant="body2" color="textSecondary">
                      No more authors to load
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
