"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Container,
} from "@mui/material";
import { BookDetailView } from "@/components/book/BookDetailView";
import { BookDetailResponse } from "@/types/book-detail";
import { bookDetailService } from "@/services/book-detail.service";

const BookDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);

  const [book, setBook] = useState<BookDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetail = async (): Promise<void> => {
      if (!bookId || isNaN(bookId)) {
        setError("Invalid book ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const bookData = await bookDetailService.getBookDetail(bookId);
        setBook(bookData);
      } catch (err) {
        console.error("Error fetching book detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load book details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  const handleBack = (): void => {
    router.back();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" color="textSecondary">
            Loading book details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Error Loading Book Details</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            <Typography variant="h6">Book Not Found</Typography>
            <Typography variant="body2">
              The requested book could not be found.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <BookDetailView book={book} onBack={handleBack} />
    </Container>
  );
};

export default BookDetailPage;
