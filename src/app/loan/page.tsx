'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Box, Typography, Modal, TextField, Select, MenuItem, Pagination
} from '@mui/material';
import { ENV } from '@/config/env';

export default function LoanListPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('BorrowDate desc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const pageSize = 3;

  const fetchLoans = async () => {
    const skip = (page - 1) * pageSize;
    let query = `?$orderby=${encodeURIComponent(sortBy)}&$skip=${skip}&$top=${pageSize}`;
    let filters: string[] = [];

    if (keyword) {
      const safeKeyword = keyword.replace(/'/g, "''");
      filters.push(`(contains(Title,'${safeKeyword}') or contains(FullName,'${safeKeyword}'))`);
    }

    if (statusFilter !== 'All') {
      filters.push(`LoanStatus eq '${statusFilter}'`);
    }

    if (filters.length > 0) {
      query += `&$filter=${filters.join(' and ')}`;
    }

    console.log("Query:", query);
    const res = await fetch(`${ENV.apiUrl}/api/loans${query}`);
    if (!res.ok) {
      console.error("Fetch failed:", res.status, res.statusText);
      return;
    }
    const data = await res.json();
    setLoans(data);
  };

  const fetchCount = async () => {
    let url = `${ENV.apiUrl}/api/loans/count?keyword=${encodeURIComponent(keyword)}`;
    if (statusFilter !== 'All') {
      url += `&status=${encodeURIComponent(statusFilter)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Count fetch failed:", res.status, res.statusText);
      return;
    }
    const count = await res.json();
    setTotalCount(count);
  };

  const refreshData = async () => {
    await fetchLoans();
    await fetchCount();
  }

  useEffect(() => {
    refreshData();
  }, [keyword, sortBy, statusFilter, page]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Danh sách Mượn Sách</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Tìm kiếm (Sách / Người mượn)"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          size="small"
        />
        <Select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          size="small"
        >
          <MenuItem value="BorrowDate desc">Ngày mượn mới nhất</MenuItem>
          <MenuItem value="BorrowDate asc">Ngày mượn cũ nhất</MenuItem>
          <MenuItem value="DueDate desc">Hạn trả xa nhất</MenuItem>
          <MenuItem value="DueDate asc">Hạn trả gần nhất</MenuItem>
          <MenuItem value="FineAmount asc">Tiền phạt thấp nhất</MenuItem>
          <MenuItem value="FineAmount desc">Tiền phạt cao nhất</MenuItem>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          size="small"
        >
          <MenuItem value="All">Tất cả trạng thái</MenuItem>
          <MenuItem value="Borrowed">Đang mượn</MenuItem>
          <MenuItem value="Overdue">Quá hạn</MenuItem>
          <MenuItem value="Returned">Đã trả</MenuItem>
        </Select>
        <Button component={Link} href="/loan/create" variant="contained">
          Tạo Mượn Sách
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người mượn</TableCell>
              <TableCell>Sách</TableCell>
              <TableCell>Ngày mượn</TableCell>
              <TableCell>Hạn trả</TableCell>
              <TableCell>Tiền phạt</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(loans ?? []).map((loan) => (
              <TableRow key={loan.loanId}>
                <TableCell>{loan.fullName}</TableCell>
                <TableCell>{loan.title}</TableCell>
                <TableCell>{new Date(loan.borrowDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{loan.fineAmount}</TableCell>
                <TableCell>{loan.loanStatus}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setSelectedLoan(loan)}>View</Button>
                  <Button size="small" component={Link} href={`/loan/edit/${loan.loanId}`}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalCount / pageSize)}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      <Modal
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24,
          minWidth: 400
        }}>
          {selectedLoan && (
            <>
              <Typography variant="h6" gutterBottom>Chi tiết Mượn Sách</Typography>
              <Typography><b>ID:</b> {selectedLoan.loanId}</Typography>
              <Typography><b>Người mượn:</b> {selectedLoan.fullName} ({selectedLoan.username})</Typography>
              <Typography><b>Email:</b> {selectedLoan.email}</Typography>
              <Typography><b>Sách:</b> {selectedLoan.title} ({selectedLoan.volumeTitle})</Typography>
              <Typography><b>Tác giả:</b> {selectedLoan.authors?.join(', ')}</Typography>
              <Typography><b>Barcode:</b> {selectedLoan.barcode}</Typography>
              <Typography><b>Ngày mượn:</b> {new Date(selectedLoan.borrowDate).toLocaleDateString()}</Typography>
              <Typography><b>Hạn trả:</b> {new Date(selectedLoan.dueDate).toLocaleDateString()}</Typography>
              <Typography><b>Ngày trả:</b> {selectedLoan.returnDate ? new Date(selectedLoan.returnDate).toLocaleDateString() : 'Chưa trả'}</Typography>
              <Typography><b>Trạng thái:</b> {selectedLoan.loanStatus}</Typography>
              <Typography><b>Tiền phạt:</b> {selectedLoan.fineAmount}</Typography>
              <Typography><b>Gia hạn:</b> {selectedLoan.extended ? 'Đã gia hạn' : 'Chưa'}</Typography>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mr: 1 }}
                  disabled={selectedLoan.extended || selectedLoan.loanStatus === 'Returned'}
                  onClick={async () => {
                    const res = await fetch(`${ENV.apiUrl}/api/loans/${selectedLoan.loanId}/extend`, { method: 'PUT' });
                    if (res.ok) {
                      alert('Gia hạn thành công');
                      await refreshData();
                      setSelectedLoan(null);
                    } else {
                      alert('Không thể gia hạn: đã gia hạn trước đó rồi.');
                    }
                  }}
                >
                  Gia hạn
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  sx={{ mr: 1 }}
                  disabled={selectedLoan.loanStatus === 'Returned'}
                  onClick={async () => {
                    await fetch(`${ENV.apiUrl}/api/loans/${selectedLoan.loanId}/return`, { method: 'PUT' });
                    alert('Đã đánh dấu đã trả');
                    await refreshData();
                    setSelectedLoan(null);
                  }}
                >
                  Đánh dấu Đã trả
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={selectedLoan.loanStatus !== 'Overdue' && selectedLoan.fineAmount <= 0}
                  onClick={async () => {
                    await fetch(`${ENV.apiUrl}/api/loans/${selectedLoan.loanId}/payfine`, { method: 'PUT' });
                    alert('Đã nộp tiền phạt');
                    await refreshData();
                    setSelectedLoan(null);
                  }}
                >
                  Đã nộp tiền phạt
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
