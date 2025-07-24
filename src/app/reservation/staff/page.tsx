'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, TextField, Select, MenuItem, Divider, Pagination, Stack
} from '@mui/material';
import { ENV } from '@/config/env';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Available', label: 'Có thể nhận' },
  { value: 'Collected', label: 'Đã nhận' },
  { value: 'Canceled', label: 'Đã hủy' },
  { value: 'Expired', label: 'Hết hạn' },
];

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xử lý',
  Available: 'Có thể nhận',
  Collected: 'Đã nhận',
  Canceled: 'Đã hủy',
  Expired: 'Hết hạn',
};

const PAGE_SIZE = 10;
const STAFF_ID = 32;

export default function StaffReservationListPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    const res = await fetch(`${ENV.apiUrl}/api/reservations?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setReservations(data.data);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line
  }, [page, keyword, status]);

  const handleCancel = async (reservationId: number) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đặt trước này?')) return;
    const res = await fetch(`${ENV.apiUrl}/api/reservations/${reservationId}/staff-cancel?staffId=${STAFF_ID}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Nhân viên đã hủy đặt trước thành công');
      fetchReservations();
    } else {
      alert(data.message || 'Không thể hủy đặt trước');
    }
  };

  const handleProcessExpired = async () => {
    if (!window.confirm('Xác nhận xử lý tất cả đặt trước hết hạn?')) return;
    const res = await fetch(`${ENV.apiUrl}/api/reservations/process-expired`, { method: 'POST' });
    const data = await res.json();
    alert(data.message || 'Đã xử lý đặt trước hết hạn');
    fetchReservations();
  };

  const handleDetail = (reservationId: number) => {
    window.location.href = `/reservation/staff/detail/${reservationId}`;
  };

  const handleEdit = (reservationId: number) => {
    window.location.href = `/reservation/staff/edit/${reservationId}`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', color: '#1a3c34', textAlign: { xs: 'center', sm: 'left' } }}
      >
        Quản lý đặt trước
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Tìm kiếm (tên sách, người dùng)"
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1); }}
          size="medium"
          sx={{ minWidth: 220 }}
        />
        <Select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          size="medium"
          sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleProcessExpired}
          sx={{ ml: { sm: 'auto' }, borderRadius: '8px', textTransform: 'none' }}
        >
          Xử lý đặt trước hết hạn
        </Button>
      </Stack>
      {loading ? (
        <Typography sx={{ color: '#455a64', textAlign: 'center' }}>Đang tải...</Typography>
      ) : reservations.length === 0 ? (
        <Typography sx={{ color: '#455a64', textAlign: 'center' }}>Không có đặt trước nào.</Typography>
      ) : (
        reservations.map((r) => (
          <Paper
            key={r.reservationId}
            sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
          >
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
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Trạng thái:</b> {STATUS_LABELS[r.reservationStatus] || r.reservationStatus || 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Ngày đặt:</b> {r.reservationDate ? new Date(r.reservationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Hết hạn:</b> {r.expirationDate ? new Date(r.expirationDate).toLocaleDateString() : 'Không rõ'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Vị trí hàng chờ:</b> {r.queuePosition ?? '...'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography sx={{ color: '#455a64' }}><b>Số bản có thể mượn:</b> {r.availableCopies ?? 'Không rõ'} / {r.totalCopies ?? 'Không rõ'}</Typography></Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="medium" onClick={() => handleDetail(r.reservationId)} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}>Xem chi tiết</Button>
              <Button variant="contained" size="medium" onClick={() => handleEdit(r.reservationId)} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#01579b' } }}>Chỉnh sửa</Button>
              <Button variant="contained" color="error" size="medium" onClick={() => handleCancel(r.reservationId)} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>Hủy</Button>
            </Box>
          </Paper>
        ))
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalCount / PAGE_SIZE)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
} 