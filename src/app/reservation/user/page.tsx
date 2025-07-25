'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, TextField, Divider
} from '@mui/material';
import { ENV } from '@/config/env';

interface ReservationListDTO {
  reservationId: number;
  reservationDate: string | null;
  expirationDate: string | null;
  reservationStatus: string | null;
  queuePosition: number | null;
  username: string | null;
  fullName: string | null;
  email: string | null;
  title: string | null;
  volumeTitle: string | null;
  authors: string[] | null;
  publisherName: string | null;
  isbn: string | null;
  totalCopies: number | null;
  availableCopies: number | null;
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<ReservationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [queuePositions, setQueuePositions] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!userId) return;
    const res = await fetch(`${ENV.apiUrl}/reservations/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
      for (const r of data) {
        fetchQueuePosition(r.reservationId);
      }
    }
    setLoading(false);
  };

  const fetchQueuePosition = async (reservationId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${ENV.apiUrl}/reservations/${reservationId}/position`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setQueuePositions((prev) => ({ ...prev, [reservationId]: data.queuePosition }));
    }
  };

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

  useEffect(() => {
    fetchReservations();
  }, [userId]); // Re-fetch when userId changes

  const handleCancel = async (reservationId: number) => {
    const token = localStorage.getItem('token');
    if (!userId) return;
    const res = await fetch(`${ENV.apiUrl}/reservations/${reservationId}/cancel?userId=${userId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Hủy đặt trước thành công');
      fetchReservations();
    } else {
      alert(data.message || 'Không thể hủy đặt trước');
    }
  };

  const handleDetail = (reservationId: number) => {
    window.location.href = `/reservation/user/${reservationId}`;
  };

  const filteredReservations = !search
    ? reservations
    : reservations.filter((r) => {
        const lower = search.toLowerCase();
        return (
          (r.title && r.title.toLowerCase().includes(lower)) ||
          (r.authors && r.authors.join(', ').toLowerCase().includes(lower)) ||
          (r.isbn && r.isbn.toLowerCase().includes(lower))
        );
      });

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          color: '#1a3c34',
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Đặt trước của tôi
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Tìm kiếm (tên sách, tác giả, ISBN)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="medium"
          fullWidth
          sx={{
            maxWidth: { xs: '100%', sm: '500px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#f7faf9',
              '&:hover fieldset': {
                borderColor: '#2e7d32',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2e7d32',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#455a64',
              '&.Mui-focused': {
                color: '#2e7d32',
              },
            },
          }}
        />
      </Box>
      {loading ? (
        <Typography sx={{ color: '#455a64', textAlign: 'center' }}>
          Đang tải...
        </Typography>
      ) : filteredReservations.length === 0 ? (
        <Typography sx={{ color: '#455a64', textAlign: 'center' }}>
          Không có đặt trước nào.
        </Typography>
      ) : (
        filteredReservations.map((r) => (
          <Paper
            key={r.reservationId}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              backgroundColor: '#fff',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: '600', color: '#1a3c34', mb: 2 }}
            >
              {r.title || 'Không rõ'}{' '}
              {r.volumeTitle ? (
                <Typography component="span" sx={{ color: '#546e7a' }}>
                  ({r.volumeTitle})
                </Typography>
              ) : null}
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e0e0e0' }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Tác giả:</b> {r.authors ? r.authors.join(', ') : 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Nhà xuất bản:</b> {r.publisherName || 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>ISBN:</b> {r.isbn || 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Ngày đặt:</b>{' '}
                  {r.reservationDate
                    ? new Date(r.reservationDate).toLocaleDateString()
                    : 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Hết hạn:</b>{' '}
                  {r.expirationDate
                    ? new Date(r.expirationDate).toLocaleDateString()
                    : 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Trạng thái:</b> {r.reservationStatus || 'Không rõ'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Vị trí hàng chờ:</b> {queuePositions[r.reservationId] ?? '...'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#455a64' }}>
                  <b>Số bản có thể mượn:</b>{' '}
                  {r.availableCopies ?? 'Không rõ'} / {r.totalCopies ?? 'Không rõ'}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="error"
                size="medium"
                onClick={() => handleCancel(r.reservationId)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  backgroundColor: '#d32f2f',
                  '&:hover': { backgroundColor: '#b71c1c' },
                }}
              >
                Hủy đặt trước
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => handleDetail(r.reservationId)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#2e7d32',
                  color: '#2e7d32',
                  '&:hover': {
                    borderColor: '#1b5e20',
                    color: '#1b5e20',
                    backgroundColor: '#e8f5e9',
                  },
                }}
              >
                Xem chi tiết
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}