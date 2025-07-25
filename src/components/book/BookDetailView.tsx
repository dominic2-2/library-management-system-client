"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
} from "@mui/material";
import {
  Book as BookIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { BookDetailResponse } from "@/types/book-detail";

interface BookDetailViewProps {
  book: BookDetailResponse;
  onBack?: () => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  onBack,
}) => {
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

  const getCopyStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case "Available":
        return "success";
      case "Reserved":
        return "info";
      case "Borrowed":
        return "warning";
      case "Lost":
      case "Damaged":
        return "error";
      default:
        return "default";
    }
  };

  const getTotalCopies = (): number => {
    return book.volumes.$values.reduce((total, volume) => {
      return (
        total +
        volume.variants.$values.reduce((variantTotal, variant) => {
          return variantTotal + variant.copies.$values.length;
        }, 0)
      );
    }, 0);
  };

  const getAvailableCopies = (): number => {
    return book.volumes.$values.reduce((total, volume) => {
      return (
        total +
        volume.variants.$values.reduce((variantTotal, variant) => {
          return (
            variantTotal +
            variant.copies.$values.filter(
              (copy) => copy.copyStatus === "Available"
            ).length
          );
        }, 0)
      );
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {onBack && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Back
          </Button>
        )}
        <BookIcon sx={{ color: "#1976d2", mr: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Book Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Book Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                src={book.coverImg}
                alt={book.title}
                sx={{
                  width: 200,
                  height: 280,
                  borderRadius: 2,
                  bgcolor: "#f5f5f5",
                  mb: 2,
                }}
              >
                {!book.coverImg && (
                  <BookIcon sx={{ fontSize: 80, color: "#999" }} />
                )}
              </Avatar>
              <Chip
                label={book.bookStatus}
                color={getStatusColor(book.bookStatus)}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {book.title}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: "#666" }} />
              <Typography variant="body2">
                <strong>Authors:</strong> {book.authors.$values.join(", ")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, color: "#666" }} />
              <Typography variant="body2">
                <strong>Category:</strong> {book.categoryName}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LanguageIcon sx={{ mr: 1, color: "#666" }} />
              <Typography variant="body2">
                <strong>Language:</strong> {book.language}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Total Copies:</strong> {getTotalCopies()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Available:</strong> {getAvailableCopies()}
              </Typography>
            </Box>

            {book.description && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Description:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {book.description}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Volumes and Variants */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              Volumes & Copies ({book.volumes.$values.length} volumes)
            </Typography>

            {book.volumes.$values.map((volume) => (
              <Card key={volume.volumeId} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Volume {volume.volumeNumber}: {volume.volumeTitle}
                  </Typography>

                  {volume.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 2 }}
                    >
                      {volume.description}
                    </Typography>
                  )}

                  {volume.variants.$values.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No variants available for this volume.
                    </Typography>
                  ) : (
                    volume.variants.$values.map((variant) => (
                      <Box key={variant.variantId} sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", mb: 1 }}
                        >
                          Edition Details
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Publisher:</strong>{" "}
                              {variant.publisherName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Edition:</strong> {variant.editionName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Publication Year:</strong>{" "}
                              {variant.publicationYear}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>ISBN:</strong> {variant.isbn}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Cover Type:</strong>{" "}
                              {variant.coverTypeName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Paper Quality:</strong>{" "}
                              {variant.paperQualityName}
                            </Typography>
                          </Grid>
                        </Grid>

                        {variant.copies.$values.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              Physical Copies ({variant.copies.$values.length})
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Barcode
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Status
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                      Location
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {variant.copies.$values.map((copy) => (
                                    <TableRow key={copy.copyId}>
                                      <TableCell>{copy.barcode}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={copy.copyStatus}
                                          color={getCopyStatusColor(
                                            copy.copyStatus
                                          )}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell>{copy.location}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
