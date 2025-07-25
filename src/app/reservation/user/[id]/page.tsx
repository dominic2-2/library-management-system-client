'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Paper, Typography, Grid, Button, Divider } from '@mui/material';
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

export default function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState<ReservationListDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${ENV.apiUrl}/reservations/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReservation(data[0] || null);
        } else if (data && typeof data === 'object') {
          setReservation(data);
        } else {
          setReservation(null);
        }
      } else {
        setReservation(null);
      }
      setLoading(false);
    };
    const fetchQueuePosition = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ENV.apiUrl}/reservations/${id}/position`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQueuePosition(data.queuePosition);
      }
    };
    if (id) {
      fetchDetail();
      fetchQueuePosition();
    }
  }, [id]);

  if (loading) {
    return (
      <Typography
        sx={{
          p: { xs: 2, sm: 4 },
          color: '#455a64',
          textAlign: 'center',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      >
        Đang tải...
      </Typography>
    );
  }

  if (!reservation) {
    return (
      <Typography
        sx={{
          p: { xs: 2, sm: 4 },
          color: '#455a64',
          textAlign: 'center',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      >
        Không tìm thấy đặt trước.
      </Typography>
    );
  }

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
        Chi tiết đặt trước #{reservation.reservationId}
      </Typography>
      <Paper
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
          {reservation.title || 'Không rõ'}{' '}
          {reservation.volumeTitle ? (
            <Typography component="span" sx={{ color: '#546e7a' }}>
              ({reservation.volumeTitle})
            </Typography>
          ) : null}
        </Typography>
        <Divider sx={{ mb: 2, borderColor: '#e0e0e0' }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Tác giả:</b> {reservation.authors ? reservation.authors.join(', ') : 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Nhà xuất bản:</b> {reservation.publisherName || 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>ISBN:</b> {reservation.isbn || 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Ngày đặt:</b>{' '}
              {reservation.reservationDate
                ? new Date(reservation.reservationDate).toLocaleDateString()
                : 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Hết hạn:</b>{' '}
              {reservation.expirationDate
                ? new Date(reservation.expirationDate).toLocaleDateString()
                : 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Trạng thái:</b> {reservation.reservationStatus || 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Vị trí hàng chờ:</b> {queuePosition ?? '...'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Số bản có thể mượn:</b>{' '}
              {reservation.availableCopies ?? 'Không rõ'} / {reservation.totalCopies ?? 'Không rõ'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ color: '#455a64' }}>
              <b>Người đặt:</b>{' '}
              {reservation.fullName || reservation.username || 'Không rõ'} (
              {reservation.email || 'Không rõ'})
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Button
        variant="outlined"
        onClick={() => window.history.back()}
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
        Quay lại
      </Button>
    </Box>
  );
}