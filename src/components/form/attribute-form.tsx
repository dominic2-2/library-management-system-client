"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

interface AttributeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  title: string;
  fieldLabel: string;
  initialData?: { id: number; name: string } | null;
  isEdit?: boolean;
}

export const AttributeForm: React.FC<AttributeFormProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  fieldLabel,
  initialData,
  isEdit = false,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && isEdit) {
      setName(initialData.name);
    } else {
      setName("");
    }
    setError("");
  }, [initialData, isEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(`${fieldLabel} is required`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({ name: name.trim() });
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label={fieldLabel}
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              error={!!error}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
