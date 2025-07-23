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
  Avatar,
} from "@mui/material";
import { Edit, Visibility, LibraryBooks, Shield } from "@mui/icons-material";

export interface CoverType {
  cover_type_id: number;
  cover_type_name: string;
  description?: string;
  durability_rating?: number;
  cost_factor?: number;
  book_count?: number;
}

export interface CoverTypesTableProps {
  data: CoverType[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (coverType: CoverType) => void;
  onView?: (id: number) => void;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
}

export const CoverTypesTable: React.FC<CoverTypesTableProps> = ({
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

  const handleEdit = (coverType: CoverType): void => {
    if (onEdit) {
      onEdit(coverType);
    }
  };

  const handleView = (id: number): void => {
    if (onView) {
      onView(id);
    }
  };

  const getCoverTypeColor = (coverTypeName: string): string => {
    const name = coverTypeName.toLowerCase();
    if (name.includes("hardcover") || name.includes("hard")) return "#795548";
    if (name.includes("paperback") || name.includes("soft")) return "#ff9800";
    if (name.includes("spiral") || name.includes("ring")) return "#9c27b0";
    if (name.includes("leather")) return "#3e2723";
    return "#607d8b";
  };

  const getDurabilityChipColor = (
    rating?: number
  ): "default" | "success" | "warning" | "error" => {
    if (!rating) return "default";
    if (rating >= 8) return "success";
    if (rating >= 6) return "warning";
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
          <LibraryBooks sx={{ color: "#ff9800" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#ff9800" }}
          >
            Cover Types Management
          </Typography>
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              bgcolor: "#ff9800",
              "&:hover": {
                bgcolor: "#f57c00",
              },
            }}
          >
            Add Cover Type
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                Cover Type
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                Durability
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                Cost Factor
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                Books Count
              </TableCell>
              {showActions && (
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#fff3e0" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} align="center">
                  <Typography color="textSecondary">
                    No cover types found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((coverType) => (
                <TableRow
                  key={coverType.cover_type_id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {coverType.cover_type_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getCoverTypeColor(coverType.cover_type_name),
                          width: 36,
                          height: 36,
                        }}
                      >
                        <Shield fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: "500" }}>
                        {coverType.cover_type_name}
                      </Typography>
                    </Box>
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
                      {coverType.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {coverType.durability_rating ? (
                      <Chip
                        label={`${coverType.durability_rating}/10`}
                        color={getDurabilityChipColor(
                          coverType.durability_rating
                        )}
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Not rated
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {coverType.cost_factor
                        ? `${coverType.cost_factor}x`
                        : "Standard"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coverType.book_count || 0}
                      color={
                        coverType.book_count && coverType.book_count > 0
                          ? "warning"
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
                              onClick={() =>
                                handleView(coverType.cover_type_id)
                              }
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
                          <Tooltip title="Edit Cover Type">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(coverType)}
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
