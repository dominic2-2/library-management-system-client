'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, Grid, Button, TextField, Select, MenuItem, Divider, Stack } from '@mui/material';
import { ENV } from '@/config/env';

const STAFF_ID = 32;

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Fulfilled', label: 'Đã hoàn thành' },
  { value: 'Canceled', label: 'Đã hủy' },
  { value: 'Expired', label: 'Hết hạn' },
];

export default function StaffReservationEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Pending');
  const [expirationDate, setExpirationDate] = useState('');
  const [processedBy, setProcessedBy] = useState(STAFF_ID);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const res = await fetch(`${ENV.apiUrl}/api/reservations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const r = data && typeof data === 'object' ? data : (Array.isArray(data) ? data[0] : null);
        setReservation(r);
        setStatus(r?.reservationStatus || 'Pending');
        setExpirationDate(r?.expirationDate ? r.expirationDate.split('T')[0] : '');
        setProcessedBy(r?.processedBy || STAFF_ID);
      }
      setLoading(false);
    };
    if (id) fetchDetail();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${ENV.apiUrl}/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationStatus: status,
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
        processedBy: Number(processedBy),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      alert(data.message || 'Cập nhật đặt trước thành công');
      router.push('/reservation/staff');
    } else {
      alert(data.message || 'Cập nhật thất bại');
    }
  };

  if (loading || !reservation) return <Typography sx={{ p: 4 }}>Đang tải...</Typography>;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a3c34' }}>
        Cập nhật đặt trước #{reservation.reservationId}
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Người xử lý (ID)"
              value={processedBy}
              onChange={e => setProcessedBy(e.target.value)}
              fullWidth
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              value={status}
              onChange={e => setStatus(e.target.value)}
              fullWidth
              size="small"
            >
              {STATUS_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
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
        </Grid>
      </Paper>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#01579b' } }}>Lưu</Button>
        <Button variant="outlined" onClick={() => router.push('/reservation/staff')} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#2e7d32', color: '#2e7d32', '&:hover': { borderColor: '#1b5e20', color: '#1b5e20', backgroundColor: '#e8f5e9' } }}>Quay lại</Button>
      </Stack>
    </Box>
  );
} 