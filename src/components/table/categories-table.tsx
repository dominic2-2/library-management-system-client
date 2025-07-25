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
  TablePagination,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { Edit, Visibility, Category } from "@mui/icons-material";

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  book_count?: number;
}

export interface CategoriesTableProps {
  data: Category[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (category: Category) => void;
  onView?: (id: number) => void;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  data,
  loading = false,
  onAdd,
  onEdit,
  onView,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  showActions = true,
}) => {
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

  const handleEdit = (category: Category): void => {
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleView = (id: number): void => {
    if (onView) {
      onView(id);
    }
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
          <Category sx={{ color: "#1976d2" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Categories Management
          </Typography>
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
            Add Category
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Category Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e3f2fd" }}>
                Description
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
                <TableCell colSpan={showActions ? 5 : 4} align="center">
                  <Typography color="textSecondary">
                    No categories found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((category) => (
                <TableRow
                  key={category.category_id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {category.category_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {category.category_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.book_count || 0}
                      color={
                        category.book_count && category.book_count > 0
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
                              onClick={() => handleView(category.category_id)}
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
                          <Tooltip title="Edit Category">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(category)}
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
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && onRowsPerPageChange && (
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
