// components/homepage/BookRow.tsx
'use client';
import { Box, Typography, Grid, Button } from '@mui/material';
import { HomepageBookDTO } from '@/types/book';
import BookCard from '@/components/book/BookCard';
import { useState } from 'react';

type Props = {
  title: string;
  books: HomepageBookDTO[];
};

export default function BookRow({ title, books }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 3);

  return (
    <Box mb={5}>
      <Typography variant="h5" mb={2} fontWeight="bold">{title}</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={2} sx={{ flexWrap: 'nowrap', width: 'max-content' }}>
          {books.slice(0, visibleCount).map((book) => (
            <Grid item key={book.bookId} sx={{ minWidth: 300 }}>
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      </Box>
      {visibleCount < books.length && (
        <Box mt={2}>
          <Button onClick={handleLoadMore} variant="outlined">Xem thêm</Button>
        </Box>
      )}
    </Box>
  );
}
