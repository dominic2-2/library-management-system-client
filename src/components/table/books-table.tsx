"use client";

import React from "react";
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
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";
import { BookWithDetails } from "@/types/book";

interface BooksTableProps {
  books: BookWithDetails[];
  loading?: boolean;
  onEdit: (bookId: number) => void;
  onView: (bookId: number) => void;
}

export const BooksTable: React.FC<BooksTableProps> = ({
  books,
  loading = false,
  onEdit,
  onView,
}) => {
  const handleView = (bookId: number): void => {
    onView(bookId);
  };

  const handleEdit = (bookId: number): void => {
    onEdit(bookId);
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
                Author
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Language
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                Volume
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
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
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
                        {book.volumes?.[0]?.volume_number || "-"}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
