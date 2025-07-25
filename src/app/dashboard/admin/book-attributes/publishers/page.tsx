"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  PublishersTable,
  Publisher,
} from "@/components/table/publishers-table";
import { PublisherService } from "@/services/publisher-service";

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Publisher | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const result = await PublisherService.getPublishers();
      let dataArray: Publisher[] = [];

      // Create interface for API response format
      interface PublisherApiResponse {
        publisherId?: number;
        publisher_id?: number;
        publisherName?: string;
        publisher_name?: string;
      }

      if (Array.isArray(result)) {
        dataArray = result.map((item: PublisherApiResponse, idx: number) => ({
          publisher_id: item.publisherId ?? item.publisher_id ?? idx,
          publisher_name: item.publisherName ?? item.publisher_name ?? "",
          address: "123 Publishing Street, Book City",
          phone:
            "+1-555-" +
            Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0"),
          email:
            (item.publisherName ?? item.publisher_name)
              ?.toLowerCase()
              .replace(/\s+/g, "") + "@publisher.com",
          established_year: 1980 + Math.floor(Math.random() * 43),
          book_count: Math.floor(Math.random() * 100),
        }));
      } else if (result && typeof result === "object") {
        const responseObj = result as Record<string, unknown>;
        if (Array.isArray(responseObj.$values)) {
          dataArray = responseObj.$values.map(
            (item: PublisherApiResponse, idx: number) => ({
              publisher_id: item.publisherId ?? item.publisher_id ?? idx,
              publisher_name: item.publisherName ?? item.publisher_name ?? "",
              address: "123 Publishing Street, Book City",
              phone:
                "+1-555-" +
                Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0"),
              email:
                (item.publisherName ?? item.publisher_name)
                  ?.toLowerCase()
                  .replace(/\s+/g, "") + "@publisher.com",
              established_year: 1980 + Math.floor(Math.random() * 43),
              book_count: Math.floor(Math.random() * 100),
            })
          );
        } else if (Array.isArray(responseObj.data)) {
          dataArray = responseObj.data.map(
            (item: PublisherApiResponse, idx: number) => ({
              publisher_id: item.publisherId ?? item.publisher_id ?? idx,
              publisher_name: item.publisherName ?? item.publisher_name ?? "",
              address: "123 Publishing Street, Book City",
              phone:
                "+1-555-" +
                Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0"),
              email:
                (item.publisherName ?? item.publisher_name)
                  ?.toLowerCase()
                  .replace(/\s+/g, "") + "@publisher.com",
              established_year: 1980 + Math.floor(Math.random() * 43),
              book_count: Math.floor(Math.random() * 100),
            })
          );
        }
      }

      setPublishers(dataArray);
    } catch (error) {
      console.error("Error fetching publishers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch publishers",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: Publisher) => {
    setEditingItem(item);
    setFormData({ name: item.publisher_name });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Publisher name is required",
        severity: "error",
      });
      return;
    }

    try {
      if (editingItem) {
        await PublisherService.updatePublisher({
          publisher_id: editingItem.publisher_id,
          publisher_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Publisher updated successfully",
          severity: "success",
        });
      } else {
        await PublisherService.createPublisher({
          publisher_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Publisher created successfully",
          severity: "success",
        });
      }
      setFormOpen(false);
      fetchPublishers();
    } catch (error) {
      console.error("Error saving publisher:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update publisher"
          : "Failed to create publisher",
        severity: "error",
      });
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({ name: "" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <PublishersTable
        data={publishers}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Publisher" : "Add New Publisher"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Publisher Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {editingItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
