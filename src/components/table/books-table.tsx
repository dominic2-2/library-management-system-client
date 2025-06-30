"use client";

import React, { useState } from "react";
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
  Chip,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { BooksTableProps, BookWithDetails } from "@/types/book";

export const BooksTable: React.FC<BooksTableProps> = ({
  books,
  loading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (bookId: number): void => {
    onView(bookId);
  };

  const handleEdit = (bookId: number): void => {
    onEdit(bookId);
  };

  const handleDelete = (bookId: number): void => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      onDelete(bookId);
    }
  };

  const formatAuthors = (authors: { author_name: string }[]): string => {
    return authors.map((author) => author.author_name).join(", ");
  };

  const formatPrice = (prices: number[]): string => {
    if (prices.length === 0) return "-";
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return `$${minPrice.toFixed(2)}`;
    }
    return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
  };

  const formatVolumes = (volumes: BookWithDetails["volumes"]): string => {
    if (volumes.length === 0) return "-";
    if (volumes.length === 1) {
      const vol = volumes[0];
      return vol.volume_title || `Volume ${vol.volume_number}`;
    }
    return `${volumes.length} volumes`;
  };

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
    const ratio = available / total;
    if (ratio > 0.7) return "success";
    if (ratio > 0.3) return "warning";
    return "error";
  };

  if (loading) {
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

  const paginatedBooks = books.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Title
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Language
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Authors
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Volumes
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Price Range
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Availability
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="textSecondary">No books found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBooks.map((book: BookWithDetails) => {
                const allPrices = book.volumes.flatMap(
                  (volume) =>
                    volume.variants
                      .map((variant) => variant.price)
                      .filter(
                        (price) => price !== undefined && price !== null
                      ) as number[]
                );

                return (
                  <TableRow
                    key={book.book_id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {book.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.category_name}
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
                        {formatAuthors(book.authors)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatVolumes(book.volumes)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatPrice(allPrices)}
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
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          startIcon={<Visibility />}
                          onClick={() => handleView(book.book_id)}
                          sx={{
                            minWidth: "auto",
                            px: 1,
                            bgcolor: "#17a2b8",
                            "&:hover": {
                              bgcolor: "#138496",
                            },
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<Edit />}
                          onClick={() => handleEdit(book.book_id)}
                          sx={{
                            minWidth: "auto",
                            px: 1,
                            bgcolor: "#ffc107",
                            color: "#000",
                            "&:hover": {
                              bgcolor: "#e0a800",
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(book.book_id)}
                          sx={{
                            minWidth: "auto",
                            px: 1,
                            bgcolor: "#dc3545",
                            "&:hover": {
                              bgcolor: "#c82333",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={books.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: "1px solid rgba(224, 224, 224, 1)",
        }}
      />
    </Paper>
  );
};
