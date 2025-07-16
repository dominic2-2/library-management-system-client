'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { AdminUpdateUserRequestDTO, User } from './user.types';

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userData: AdminUpdateUserRequestDTO) => Promise<void>;
}

const getRoleIdFromName = (roleName: string): number => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
      return 1;
    case 'staff':
      return 2;
    case 'user':
      return 3;
    default:
      return 3; // Default to User
  }
};

const EditUserDialog: React.FC<Props> = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AdminUpdateUserRequestDTO>({
    userId: 0,
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
    roleId: 3,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Xử lý roleId: ưu tiên roleId, nếu không có thì convert từ roleName
      let resolvedRoleId: number;
      
      if (user.roleId !== null && user.roleId !== undefined) {
        resolvedRoleId = user.roleId;
      } else if (user.roleName) {
        resolvedRoleId = getRoleIdFromName(user.roleName);
        console.log(`🔴 Converted roleName "${user.roleName}" to roleId ${resolvedRoleId}`);
      } else {
        resolvedRoleId = 3; // Default to User
      }

      console.log('🔴 Final resolved roleId:', resolvedRoleId);

      setFormData({
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        roleId: resolvedRoleId,
        isActive: user.isActive
      });
    } else {
      // Reset form khi không có user
      setFormData({
        userId: 0,
        username: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
        roleId: 3,
        isActive: true
      });
    }
  }, [user]);

  const handleChange = (field: keyof AdminUpdateUserRequestDTO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Họ và tên"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số điện thoại"
                value={formData.phone}
                onChange={handleChange('phone')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Địa chỉ"
                value={formData.address}
                onChange={handleChange('address')}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  label="Vai trò"
                  value={formData.roleId ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      roleId: Number(e.target.value)
                    }))
                  }
                >
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Staff</MenuItem>
                  <MenuItem value={3}>User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked
                      }))
                    }
                    color="primary"
                  />
                }
                label="Hoạt động"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;
