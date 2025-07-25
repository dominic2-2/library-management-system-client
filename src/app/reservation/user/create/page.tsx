'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, MenuItem, Select, InputLabel, FormControl, Card, CardContent, CircularProgress } from '@mui/material';
import { ENV } from '@/config/env';
import { useSearchParams } from 'next/navigation';

export default function CreateReservationPage() {
  const [variantId, setVariantId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');

  useEffect(() => {
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

  useEffect(() => {
    const fetchVariants = async () => {
      if (!bookId) return;
      setLoading(true);
      setMessage('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${ENV.apiUrl}/reservations/availability/book/${bookId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setVariants(data);
          if (data.length > 0) {
            setVariantId(data[0].variantId.toString());
            setSelectedVariant(data[0]);
          }
        } else {
          setMessage('Không tìm thấy thông tin các bản sách.');
        }
      } catch (e) {
        setMessage('Lỗi khi tải dữ liệu.');
      }
      setLoading(false);
    };
    fetchVariants();
  }, [bookId]);

  useEffect(() => {
    if (!variantId) { 
      setSelectedVariant(null); 
      setAvailability(null);
      setMessage('');
      return; 
    }
    const found = variants.find(v => v.variantId.toString() === variantId);
    setSelectedVariant(found || null);
    setAvailability(null);
    setMessage('');
  }, [variantId, variants]);

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
      setMessage('Không xác định được người dùng.');
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
      setAvailability(null);
      setExpirationDate('');
    } else {
      setMessage(data.message || 'Không thể tạo đặt trước.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Đặt trước sách
      </Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={loading || variants.length === 0}>
              <InputLabel id="variant-select-label">Chọn bản sách</InputLabel>
              <Select
                labelId="variant-select-label"
                value={variantId}
                label="Chọn bản sách"
                onChange={e => setVariantId(e.target.value)}
              >
                {variants.length === 0 && (
                  <MenuItem value="" disabled>
                    Không có bản sách nào
                  </MenuItem>
                )}
                {variants.map((v) => (
                  <MenuItem value={v.variantId} key={v.variantId}>
                    {v.title}
                    {v.volumeTitle ? ` - Tập: ${v.volumeTitle}` : ''}
                    {v.isbn ? ` - ISBN: ${v.isbn}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkAvailability}
              disabled={!variantId || loading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Kiểm tra điều kiện đặt trước'}
            </Button>
          </Grid>
        </Grid>
        {selectedVariant && (
          <Card sx={{ mt: 3, borderRadius: 2, bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Thông tin bản sách</Typography>
              <Typography><b>Variant ID:</b> {selectedVariant.variantId}</Typography>
              <Typography><b>Tên sách:</b> {selectedVariant.title || 'Không rõ'}</Typography>
              <Typography><b>Tác giả:</b> {selectedVariant.authors ? selectedVariant.authors.join(', ') : 'Không rõ'}</Typography>
              <Typography><b>Nhà xuất bản:</b> {selectedVariant.publisherName || 'Không rõ'}</Typography>
              <Typography><b>ISBN:</b> {selectedVariant.isbn || 'Không rõ'}</Typography>
            </CardContent>
          </Card>
        )}
        {availability && (
          <Card sx={{ mt: 3, borderRadius: 2, bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Kết quả kiểm tra</Typography>
              <Typography><b>Số bản có thể mượn:</b> {availability.availableCopies ?? 'Không rõ'} / {availability.totalCopies ?? 'Không rõ'}</Typography>
              <Typography><b>Đang chờ:</b> {availability.pendingReservations ?? 'Không rõ'}</Typography>
              <Typography><b>Có thể đặt trước:</b> {availability.canReserve ? 'Có' : 'Không'}</Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, py: 1.5 }}
                disabled={!availability.canReserve || loading}
                onClick={handleReserve}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Đặt trước'}
              </Button>
            </CardContent>
          </Card>
        )}
        {message && (
          <Typography 
            sx={{ mt: 3, textAlign: 'center' }} 
            color={message.includes('thành công') ? 'success.main' : 'error.main'}
            variant="body1"
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}