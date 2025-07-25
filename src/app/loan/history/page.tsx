'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Select, MenuItem, Button
} from '@mui/material';
import { ENV } from '@/config/env';

export default function LoanHistoryPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');

  const fetchLoans = async () => {
    setLoading(true);
    if (!username) return;
    let query = `?$orderby=BorrowDate asc&$filter=UserName eq '${username}'`;

    let filters: string[] = [];
    if (statusFilter !== 'All') {
      filters.push(`LoanStatus eq '${statusFilter}'`);
    }
    if (keyword) {
      const safeKeyword = keyword.replace(/'/g, "''");
      filters.push(`(contains(Title,'${safeKeyword}') or contains(Barcode,'${safeKeyword}'))`);
    }

    if (filters.length > 0) {
      query += ` and ${filters.join(' and ')}`;
    }

    const token = localStorage.getItem('token');
    const res = await fetch(`${ENV.apiUrl}/loans${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setLoans(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Lấy username từ profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${ENV.apiUrl}/user/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        }
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [keyword, statusFilter, username]);

  const handleExtend = async (loanId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${ENV.apiUrl}/loans/${loanId}/extend`, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) {
      alert('Gia hạn thành công');
      await fetchLoans();
    } else {
      alert('Không thể gia hạn (có thể đã gia hạn trước đó)');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Lịch sử Mượn Sách</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm (Sách / Barcode)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          size="small"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
        >
          <MenuItem value="All">Tất cả trạng thái</MenuItem>
          <MenuItem value="Borrowed">Đang mượn</MenuItem>
          <MenuItem value="Overdue">Quá hạn</MenuItem>
          <MenuItem value="Returned">Đã trả</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        loans.map((loan) => (
          <Paper key={loan.loanId} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6">{loan.title} ({loan.volumeTitle})</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}><b>Tác giả:</b> {loan.authors.join(', ')}</Grid>
              <Grid item xs={6}><b>Barcode:</b> {loan.barcode}</Grid>
              <Grid item xs={6}><b>Ngày mượn:</b> {new Date(loan.borrowDate).toLocaleDateString()}</Grid>
              <Grid item xs={6}><b>Hạn trả:</b> {new Date(loan.dueDate).toLocaleDateString()}</Grid>
              <Grid item xs={6}><b>Ngày trả:</b> {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'Chưa trả'}</Grid>
              <Grid item xs={6}><b>Trạng thái:</b> {loan.loanStatus}</Grid>
              <Grid item xs={6}><b>Tiền phạt:</b> {loan.fineAmount}</Grid>
              <Grid item xs={6}><b>Gia hạn:</b> {loan.extended ? 'Đã gia hạn' : 'Chưa'}</Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                disabled={loan.extended || loan.loanStatus === 'Returned'}
                onClick={() => handleExtend(loan.loanId)}
              >
                Gia hạn thêm 7 ngày
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}
