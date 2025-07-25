'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, Paper, Typography, Grid, FormControl, InputLabel, TextField, Select, MenuItem, Button
} from '@mui/material';
import { ENV } from '@/config/env';

export default function EditLoanPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // local state để chỉnh
  const [loanStatus, setLoanStatus] = useState('');
  const [fineAmount, setFineAmount] = useState(0);
  const [extended, setExtended] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ENV.apiUrl}/loans/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        alert('Không tìm thấy thông tin mượn sách');
        router.push('/loan');
        return;
      }
      const loadedLoan = await res.json();
      setLoan(loadedLoan);
      setLoanStatus(loadedLoan.loanStatus);
      setFineAmount(loadedLoan.fineAmount);
      setExtended(loadedLoan.extended);
      setLoading(false);
    };

    if (id) fetchLoan();
  }, [id, router]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${ENV.apiUrl}/loans/${loan.loanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        loanStatus,
        fineAmount,
        extended
      })
    });

    if (res.ok) {
      alert('Cập nhật thành công');
      router.push('/loan');
    } else {
      alert('Cập nhật thất bại');
    }
  };

  if (loading || !loan) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Chỉnh sửa Mượn Sách</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin Người mượn</Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}><b>Username:</b></Grid><Grid item xs={6}>{loan.username}</Grid>
          <Grid item xs={6}><b>Họ tên:</b></Grid><Grid item xs={6}>{loan.fullName}</Grid>
          <Grid item xs={6}><b>Email:</b></Grid><Grid item xs={6}>{loan.email}</Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin Sách</Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}><b>Tiêu đề:</b></Grid><Grid item xs={6}>{loan.title}</Grid>
          <Grid item xs={6}><b>Tựa volume:</b></Grid><Grid item xs={6}>{loan.volumeTitle}</Grid>
          <Grid item xs={6}><b>Tác giả:</b></Grid><Grid item xs={6}>{loan.authors.join(', ')}</Grid>
          <Grid item xs={6}><b>Barcode:</b></Grid><Grid item xs={6}>{loan.barcode}</Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin Mượn Sách</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ngày mượn"
              value={new Date(loan.borrowDate).toLocaleDateString()}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Hạn trả"
              value={new Date(loan.dueDate).toLocaleDateString()}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ngày trả"
              value={loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'Chưa trả'}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="loan-status-label">Trạng thái</InputLabel>
              <Select
                labelId="loan-status-label"
                value={loanStatus}
                label="Trạng thái"
                onChange={(e) => setLoanStatus(e.target.value)}
              >
                <MenuItem value="Borrowed">Đang mượn</MenuItem>
                <MenuItem value="Overdue">Quá hạn</MenuItem>
                <MenuItem value="Returned">Đã trả</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tiền phạt"
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(Number(e.target.value))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="extended-label">Gia hạn</InputLabel>
              <Select
                labelId="extended-label"
                label="Gia hạn"
                value={extended ? 'true' : 'false'}
                onChange={(e) => setExtended(e.target.value === 'true')}
              >
                <MenuItem value="false">Chưa gia hạn</MenuItem>
                <MenuItem value="true">Đã gia hạn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>Lưu thay đổi</Button>
        </Box>
      </Paper>
    </Box>
  );
}
