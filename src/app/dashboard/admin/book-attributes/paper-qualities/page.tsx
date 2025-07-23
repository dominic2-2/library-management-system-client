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
  PaperQualitiesTable,
  PaperQuality,
} from "@/components/table/paper-qualities-table";
import { PaperQualityService } from "@/services/paper-quality-service";

export default function PaperQualitiesPage() {
  const [paperQualities, setPaperQualities] = useState<PaperQuality[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaperQuality | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchPaperQualities = async () => {
    setLoading(true);
    try {
      const result = await PaperQualityService.getPaperQualities();
      let dataArray: PaperQuality[] = [];

      // Create interface for API response format
      interface PaperQualityApiResponse {
        paperQualityId?: number;
        paper_quality_id?: number;
        paperQualityName?: string;
        paper_quality_name?: string;
      }

      if (Array.isArray(result)) {
        dataArray = result.map(
          (item: PaperQualityApiResponse, idx: number) => ({
            paper_quality_id:
              item.paperQualityId ?? item.paper_quality_id ?? idx,
            paper_quality_name:
              item.paperQualityName ?? item.paper_quality_name ?? "",
            description: "Premium paper quality",
            gsm_weight: 70 + Math.floor(Math.random() * 50), // 70-120 GSM
            eco_friendly: Math.random() > 0.5,
            quality_rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
            book_count: Math.floor(Math.random() * 60),
          })
        );
      } else if (result && typeof result === "object") {
        const responseObj = result as Record<string, unknown>;
        if (Array.isArray(responseObj.$values)) {
          dataArray = responseObj.$values.map(
            (item: PaperQualityApiResponse, idx: number) => ({
              paper_quality_id:
                item.paperQualityId ?? item.paper_quality_id ?? idx,
              paper_quality_name:
                item.paperQualityName ?? item.paper_quality_name ?? "",
              description: "Premium paper quality",
              gsm_weight: 70 + Math.floor(Math.random() * 50),
              eco_friendly: Math.random() > 0.5,
              quality_rating: Math.floor(Math.random() * 3) + 3,
              book_count: Math.floor(Math.random() * 60),
            })
          );
        } else if (Array.isArray(responseObj.data)) {
          dataArray = responseObj.data.map(
            (item: PaperQualityApiResponse, idx: number) => ({
              paper_quality_id:
                item.paperQualityId ?? item.paper_quality_id ?? idx,
              paper_quality_name:
                item.paperQualityName ?? item.paper_quality_name ?? "",
              description: "Premium paper quality",
              gsm_weight: 70 + Math.floor(Math.random() * 50),
              eco_friendly: Math.random() > 0.5,
              quality_rating: Math.floor(Math.random() * 3) + 3,
              book_count: Math.floor(Math.random() * 60),
            })
          );
        }
      }

      setPaperQualities(dataArray);
    } catch (error) {
      console.error("Error fetching paper qualities:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch paper qualities",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaperQualities();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setFormOpen(true);
  };

  const handleEdit = (item: PaperQuality) => {
    setEditingItem(item);
    setFormData({ name: item.paper_quality_name });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Paper quality name is required",
        severity: "error",
      });
      return;
    }

    try {
      if (editingItem) {
        await PaperQualityService.updatePaperQuality({
          paper_quality_id: editingItem.paper_quality_id,
          paper_quality_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Paper quality updated successfully",
          severity: "success",
        });
      } else {
        await PaperQualityService.createPaperQuality({
          paper_quality_name: formData.name,
        });
        setSnackbar({
          open: true,
          message: "Paper quality created successfully",
          severity: "success",
        });
      }
      setFormOpen(false);
      fetchPaperQualities();
    } catch (error) {
      console.error("Error saving paper quality:", error);
      setSnackbar({
        open: true,
        message: editingItem
          ? "Failed to update paper quality"
          : "Failed to create paper quality",
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
      <PaperQualitiesTable
        data={paperQualities}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Paper Quality" : "Add New Paper Quality"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Paper Quality Name"
            fullWidth
            variant="outlined"
            value={formData.name ?? ""}
            onChange={(e) => setFormData({ name: e.target.value ?? "" })}
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
