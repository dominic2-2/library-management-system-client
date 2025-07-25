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
  Rating,
} from "@mui/material";
import { Edit, Visibility, Description, Eco } from "@mui/icons-material";

export interface PaperQuality {
  paper_quality_id: number;
  paper_quality_name: string;
  description?: string;
  gsm_weight?: number;
  eco_friendly?: boolean;
  quality_rating?: number;
  book_count?: number;
}

export interface PaperQualitiesTableProps {
  data: PaperQuality[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (paperQuality: PaperQuality) => void;
  onView?: (id: number) => void;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showActions?: boolean;
}

export const PaperQualitiesTable: React.FC<PaperQualitiesTableProps> = ({
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

  const handleEdit = (paperQuality: PaperQuality): void => {
    if (onEdit) {
      onEdit(paperQuality);
    }
  };

  const handleView = (id: number): void => {
    if (onView) {
      onView(id);
    }
  };

  const getPaperQualityColor = (qualityName: string): string => {
    const name = qualityName.toLowerCase();
    if (name.includes("premium") || name.includes("high")) return "#4caf50";
    if (name.includes("standard") || name.includes("normal")) return "#2196f3";
    if (name.includes("economy") || name.includes("basic")) return "#ff9800";
    if (name.includes("recycled") || name.includes("eco")) return "#8bc34a";
    return "#9c27b0";
  };

  const getGsmColor = (
    gsm?: number
  ): "default" | "success" | "warning" | "error" => {
    if (!gsm) return "default";
    if (gsm >= 90) return "success";
    if (gsm >= 70) return "warning";
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
          <Description sx={{ color: "#9c27b0" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#9c27b0" }}
          >
            Paper Qualities Management
          </Typography>
        </Box>
        {onAdd && (
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{
              bgcolor: "#9c27b0",
              "&:hover": {
                bgcolor: "#7b1fa2",
              },
            }}
          >
            Add Paper Quality
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                Paper Quality
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                GSM Weight
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                Quality Rating
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
                Books Count
              </TableCell>
              {showActions && (
                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f3e5f5" }}>
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
                    No paper qualities found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((paperQuality) => (
                <TableRow
                  key={paperQuality.paper_quality_id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {paperQuality.paper_quality_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getPaperQualityColor(
                            paperQuality.paper_quality_name
                          ),
                          width: 36,
                          height: 36,
                        }}
                      >
                        {paperQuality.eco_friendly ? (
                          <Eco fontSize="small" />
                        ) : (
                          <Description fontSize="small" />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "500" }}>
                          {paperQuality.paper_quality_name}
                        </Typography>
                        {paperQuality.eco_friendly && (
                          <Chip
                            label="Eco-Friendly"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5, fontSize: "0.6rem", height: 16 }}
                          />
                        )}
                      </Box>
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
                      {paperQuality.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {paperQuality.gsm_weight ? (
                      <Chip
                        label={`${paperQuality.gsm_weight} GSM`}
                        color={getGsmColor(paperQuality.gsm_weight)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Not specified
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {paperQuality.quality_rating ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Rating
                          value={paperQuality.quality_rating}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                        <Typography variant="caption" color="textSecondary">
                          ({paperQuality.quality_rating}/5)
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Not rated
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={paperQuality.book_count || 0}
                      color={
                        paperQuality.book_count && paperQuality.book_count > 0
                          ? "secondary"
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
                                handleView(paperQuality.paper_quality_id)
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
                          <Tooltip title="Edit Paper Quality">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(paperQuality)}
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
