'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField } from '@mui/material';
import { ENV } from '@/config/env';

const USER_ID = 35;

export default function CreateReservationPage() {
  const [variantId, setVariantId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Lấy userId từ profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${ENV.apiUrl}/user/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        }
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  const checkAvailability = async () => {
    setLoading(true);
    setMessage('');
    setAvailability(null);
    const token = localStorage.getItem('token');
    const res = await fetch(`${ENV.apiUrl}/reservations/availability/${variantId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setAvailability(data);
    } else {
      setMessage('Không tìm thấy sách hoặc lỗi khi kiểm tra.');
    }
    setLoading(false);
  };

  const handleReserve = async () => {
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    if (!userId) {
      setMessage('Không xác định được user.');
      setLoading(false);
      return;
    }
    const res = await fetch(`${ENV.apiUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: userId,
        variantId: Number(variantId),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Đặt trước thành công!');
    } else {
      setMessage(data.message || 'Không thể tạo đặt trước.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Đặt trước sách</Typography>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Variant ID"
              value={variantId}
              onChange={e => setVariantId(e.target.value)}
              fullWidth
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Ngày hết hạn"
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={checkAvailability} disabled={!variantId || loading}>
              Kiểm tra điều kiện đặt trước
            </Button>
          </Grid>
        </Grid>
        {availability && (
          <Box sx={{ mt: 2 }}>
            <Typography><b>Tên sách:</b> {availability.title || 'Không rõ'}</Typography>
            <Typography><b>Tác giả:</b> {availability.authors ? availability.authors.join(', ') : 'Không rõ'}</Typography>
            <Typography><b>Nhà xuất bản:</b> {availability.publisherName || 'Không rõ'}</Typography>
            <Typography><b>ISBN:</b> {availability.isbn || 'Không rõ'}</Typography>
            <Typography><b>Số bản có thể mượn:</b> {availability.availableCopies ?? 'Không rõ'} / {availability.totalCopies ?? 'Không rõ'}</Typography>
            <Typography><b>Đang chờ:</b> {availability.pendingReservations ?? 'Không rõ'}</Typography>
            <Typography><b>Có thể đặt trước:</b> {availability.canReserve ? 'Có' : 'Không'}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!availability.canReserve || loading}
              onClick={handleReserve}
            >
              Đặt trước
            </Button>
          </Box>
        )}
        {message && <Typography sx={{ mt: 2 }} color={message.includes('thành công') ? 'primary' : 'error'}>{message}</Typography>}
      </Paper>
    </Box>
  );
} 