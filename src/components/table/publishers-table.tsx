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
import {
  Edit,
  Visibility,
  Business,
  LocationOn,
  Phone,
  Email,
} from "@mui/icons-material";

export interface Publisher {
  publisher_id: number;
  publisher_name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  established_year?: number;
  book_count?: number;
}

export interface PublishersTableProps {
  data: Publisher[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (publisher: Publisher) => void;
  onView?: (id: number) => void;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
}

export const PublishersTable: React.FC<PublishersTableProps> = ({
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

  const handleEdit = (publisher: Publisher): void => {
    if (onEdit) {
      onEdit(publisher);
    }
  };

  const handleView = (id: number): void => {
    if (onView) {
      onView(id);
    }
  };

  const getPublisherInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
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
          <Business sx={{ color: "#4caf50" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#4caf50" }}
          >
            Publishers Management
          </Typography>
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              bgcolor: "#4caf50",
              "&:hover": {
                bgcolor: "#388e3c",
              },
            }}
          >
            Add Publisher
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                Publisher
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                Contact Info
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                Established
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                Books Published
              </TableCell>
              {showActions && (
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#e8f5e8" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 6 : 5} align="center">
                  <Typography color="textSecondary">
                    No publishers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((publisher) => (
                <TableRow
                  key={publisher.publisher_id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {publisher.publisher_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "#4caf50",
                          width: 40,
                          height: 40,
                          fontSize: "0.875rem",
                        }}
                      >
                        {getPublisherInitials(publisher.publisher_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "500" }}>
                          {publisher.publisher_name}
                        </Typography>
                        {publisher.website && (
                          <Typography variant="caption" color="primary">
                            {publisher.website}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {publisher.address && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            {publisher.address}
                          </Typography>
                        </Box>
                      )}
                      {publisher.phone && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Phone fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            {publisher.phone}
                          </Typography>
                        </Box>
                      )}
                      {publisher.email && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Email fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            {publisher.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {publisher.established_year || "Unknown"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={publisher.book_count || 0}
                      color={
                        publisher.book_count && publisher.book_count > 0
                          ? "success"
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
                              onClick={() => handleView(publisher.publisher_id)}
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
                          <Tooltip title="Edit Publisher">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(publisher)}
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
