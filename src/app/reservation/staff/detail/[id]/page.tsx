'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, Grid, Button, Divider, Stack } from '@mui/material';
import { ENV } from '@/config/env';

const STAFF_ID = 32;

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xử lý',
  Available: 'Có thể nhận',
  Collected: 'Đã nhận',
  Canceled: 'Đã hủy',
  Expired: 'Hết hạn',
};

export default function StaffReservationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const res = await fetch(`${ENV.apiUrl}/api/reservations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReservation(data && typeof data === 'object' ? data : (Array.isArray(data) ? data[0] : null));
      } else {
        setReservation(null);
      }
      setLoading(false);
    };
    const fetchQueuePosition = async () => {
      const res = await fetch(`${ENV.apiUrl}/api/reservations/${id}/position`);
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

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đặt trước này?')) return;
    const res = await fetch(`${ENV.apiUrl}/api/reservations/${id}/staff-cancel?staffId=${STAFF_ID}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || 'Nhân viên đã hủy đặt trước thành công');
    router.push('/reservation/staff');
  };

  const handleEdit = () => {
    router.push(`/reservation/staff/edit/${id}`);
  };

  const handleQueue = () => {
    if (reservation?.variantId) {
      router.push(`/reservation/staff/queue/${reservation.variantId}`);
    } else {
      alert('Không có variantId để xem hàng chờ.');
    }
  };

  if (loading) return <Typography sx={{ p: 4 }}>Đang tải...</Typography>;
  if (!reservation) return <Typography sx={{ p: 4 }}>Không tìm thấy đặt trước.</Typography>;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a3c34' }}>
        Chi tiết đặt trước #{reservation.reservationId}
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a3c34', mb: 2 }}>
          {reservation.title || 'Không rõ'}{' '}
          {reservation.volumeTitle ? (
            <Typography component="span" sx={{ color: '#546e7a' }}>
              ({reservation.volumeTitle})
            </Typography>
          ) : null}
        </Typography>
        <Divider sx={{ mb: 2, borderColor: '#e0e0e0' }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Người đặt:</b> {reservation.fullName || reservation.username || 'Không rõ'} ({reservation.email || 'Không rõ'})</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Trạng thái:</b> {STATUS_LABELS[reservation.reservationStatus] || reservation.reservationStatus || 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Ngày đặt:</b> {reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Hết hạn:</b> {reservation.expirationDate ? new Date(reservation.expirationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Vị trí hàng chờ:</b> {queuePosition ?? '...'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Số bản có thể mượn:</b> {reservation.availableCopies ?? 'Không rõ'} / {reservation.totalCopies ?? 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>ISBN:</b> {reservation.isbn || 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Tác giả:</b> {reservation.authors ? reservation.authors.join(', ') : 'Không rõ'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Nhà xuất bản:</b> {reservation.publisherName || 'Không rõ'}</Typography></Grid>
        </Grid>
      </Paper>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleEdit} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#01579b' } }}>Chỉnh sửa</Button>
        <Button variant="contained" color="error" onClick={handleCancel} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>Hủy bởi nhân viên</Button>
        <Button variant="outlined" onClick={handleQueue} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}>Xem hàng chờ của sách</Button>
      </Stack>
      <Button
        variant="outlined"
        onClick={() => router.push('/reservation/staff')}
        sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}
      >
        Quay lại
      </Button>
    </Box>
  );
} 