'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, Grid, Button, Divider, Stack } from '@mui/material';
import { ENV } from '@/config/env';

export default function StaffReservationQueuePage() {
  const { id } = useParams();
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      const res = await fetch(`${ENV.apiUrl}/api/reservations/queue/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
      setLoading(false);
    };
    if (id) fetchQueue();
  }, [id]);

  const handleNext = async () => {
    const res = await fetch(`${ENV.apiUrl}/api/reservations/next/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.reservationId) {
        router.push(`/reservation/staff/detail/${data.reservationId}`);
      } else {
        alert('Không tìm thấy đơn đặt sớm nhất.');
      }
    }
  };

  const handleDetail = (reservationId: number) => {
    router.push(`/reservation/staff/detail/${reservationId}`);
  };

  if (loading) return <Typography sx={{ p: 4 }}>Đang tải...</Typography>;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a3c34' }}>
        Hàng chờ đặt trước cho sách #{id}
      </Typography>
      <Button variant="contained" onClick={handleNext} sx={{ mb: 3, borderRadius: '8px', textTransform: 'none', backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#01579b' } }}>Đơn đặt sớm nhất</Button>
      {queue.length === 0 ? (
        <Typography sx={{ color: '#455a64', textAlign: 'center' }}>Không có đơn nào trong hàng chờ.</Typography>
      ) : (
        queue.map((r) => (
          <Paper key={r.reservationId} sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a3c34', mb: 2 }}>
              {r.title || 'Không rõ'}{' '}
              {r.volumeTitle ? (
                <Typography component="span" sx={{ color: '#546e7a' }}>
                  ({r.volumeTitle})
                </Typography>
              ) : null}
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e0e0e0' }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Người đặt:</b> {r.fullName || r.username || 'Không rõ'} ({r.email || 'Không rõ'})</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Trạng thái:</b> {r.reservationStatus || 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Ngày đặt:</b> {r.reservationDate ? new Date(r.reservationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Hết hạn:</b> {r.expirationDate ? new Date(r.expirationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Vị trí hàng chờ:</b> {r.queuePosition ?? '...'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Số bản có thể mượn:</b> {r.availableCopies ?? 'Không rõ'} / {r.totalCopies ?? 'Không rõ'}</Typography></Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="medium" onClick={() => handleDetail(r.reservationId)} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}>Xem chi tiết</Button>
            </Box>
          </Paper>
        ))
      )}
      <Button
        variant="outlined"
        onClick={() => window.location.href = '/reservation/staff'}
        sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}
      >
        Quay lại
      </Button>
    </Box>
  );
} 