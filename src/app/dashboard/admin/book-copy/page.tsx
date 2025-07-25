"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { BookCopiesTable } from "../../../../components/table/book-copies-table";
import { AddBookCopyDialog } from "../../../../components/form/add-book-copy-dialog";
import { bookCopyService } from "../../../../services/book-copy.service";
import { CreateBookCopyRequest } from "../../../../types/book-copy";

const BookCopyPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddBookCopy = async (copyData: CreateBookCopyRequest) => {
    setLoading(true);
    try {
      await bookCopyService.createBookCopy(copyData);
      setDialogOpen(false);
      // TODO: Refresh the table data
      // You might want to add a refresh callback to BookCopiesTable or use a state management solution
      console.log("Book copy created successfully");
    } catch (error) {
      console.error("Error creating book copy:", error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Quản lý bản sao sách
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Danh sách tất cả các bản sao vật lý của sách trong thư viện
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Thêm bản sao
          </Button>
        </Box>
      </Paper>

      {/* Book Copies Table */}
      <BookCopiesTable />

      {/* Add Book Copy Dialog */}
      <AddBookCopyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddBookCopy}
        loading={loading}
      />
    </Box>
  );
};

export default BookCopyPage;
