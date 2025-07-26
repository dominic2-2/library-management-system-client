"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  CircularProgress,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  Visibility, 
  Edit, 
  Delete,
  Book as BookIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { BookWithDetails } from "@/types/book";
import { ENV } from "@/config/env";

interface BooksTableProps {
  books: BookWithDetails[];
  loading?: boolean;
  loadingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  enableInfiniteScroll?: boolean;
  onAdd?: () => void;
  onEdit?: (book: BookWithDetails) => void;
  onDelete?: (book: BookWithDetails) => void;
  onView?: (bookId: number) => void;
  showActions?: boolean;
  searchInput?: React.ReactNode;
  apiConnected?: boolean;
}

export const BooksTable: React.FC<BooksTableProps> = ({
  books,
  loading = false,
  loadingMore = false,
  hasNextPage = false,
  onLoadMore,
  totalCount = 0,
  enableInfiniteScroll = true,
  onAdd,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  searchInput,
  apiConnected = true,
}) => {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleView = (bookId: number): void => {
    if (onView) {
      onView(bookId);
    }
  };

  const handleEdit = (book: BookWithDetails): void => {
    if (onEdit) {
      onEdit(book);
    }
  };

  const handleDelete = (book: BookWithDetails): void => {
    if (onDelete) {
      onDelete(book);
    }
  };

  const handleTitleClick = (bookId: number): void => {
    router.push(`/dashboard/admin/book/${bookId}`);
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
  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "warning";
      case "Deleted":
        return "error";
      default:
        return "default";
    }
  };

  const getAvailabilityColor = (
    available: number,
    total: number
  ): "success" | "warning" | "error" => {
    if (total === 0) return "error";
    const ratio = available / total;
    if (ratio > 0.7) return "success";
    if (ratio > 0.3) return "warning";
    return "error";
  };

  if (loading && books.length === 0) {
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
          <BookIcon sx={{ color: "#1976d2" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Books Management
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={`Total: ${totalCount}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {!apiConnected && (
            <Chip
              label={`⚠️ API Disconnected`}
              size="small"
              color="error"
              variant="outlined"
              sx={{
                bgcolor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
              }}
            />
          )}
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Add Book
          </Button>
        )}
      </Box>

      {/* API Connection Warning */}
      {!apiConnected && (
        <Box
          sx={{
            p: 2,
            bgcolor: "rgba(244, 67, 54, 0.1)",
            borderBottom: "1px solid rgba(244, 67, 54, 0.3)",
          }}
        >
          <Typography variant="body2" color="error">
            ⚠️ API Connection Failed - Check your backend at {ENV.apiUrl}
          </Typography>
        </Box>
      )}

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
                Cover
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Title
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Author
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Language
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Total Volume
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Availability
              </TableCell>
              {showActions && (
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} align="center">
                  <Typography color="textSecondary">No books found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book: BookWithDetails) => {
                return (
                  <TableRow
                    key={book.book_id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Avatar
                        src={book.coverImg}
                        alt={book.title}
                        sx={{
                          width: 40,
                          height: 56,
                          borderRadius: 1,
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        {!book.coverImg && <BookIcon sx={{ color: "#999" }} />}
                      </Avatar>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: "medium",
                          color: "#1976d2",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                            color: "#1565c0",
                          }
                        }}
                        onClick={() => handleTitleClick(book.book_id)}
                      >
                        {book.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.authors?.[0]?.author_name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.language || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.book_status}
                        color={getStatusColor(book.book_status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.volumes?.length || 0} volumes
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${book.available_copies}/${book.total_copies}`}
                          color={getAvailabilityColor(
                            book.available_copies,
                            book.total_copies
                          )}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="textSecondary">
                          available
                        </Typography>
                      </Box>
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {onView && (
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleView(book.book_id)}
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
                            <Tooltip title="Edit Book">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleEdit(book)}
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
                            <Tooltip title="Delete Book">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(book)}
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
                );
              })
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
                          Loading more books...
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
            {enableInfiniteScroll && !hasNextPage && books.length > 0 && (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} align="center">
                  <Box py={2}>
                    <Typography variant="body2" color="textSecondary">
                      No more books to load
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
