'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Alert,
  TablePagination,
  IconButton,
  Button,
  styled
} from '@mui/material';
import { 
  FirstPage, 
  LastPage, 
  NavigateBefore, 
  NavigateNext 
} from '@mui/icons-material';

// Styled components cho custom pagination
const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(0.5),
  backgroundColor: '#2b2b2b',
  color: '#fff',
}));

const PageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: '40px',
  height: '40px',
  padding: '8px',
  color: active ? '#fff' : '#999',
  backgroundColor: active ? '#555' : 'transparent',
  border: 'none',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: active ? '#555' : '#444',
    color: '#fff',
  },
}));

const PageInfo = styled('span')(({ theme }) => ({
  color: '#999',
  margin: '0 12px',
  fontSize: '14px',
}));

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  rowKey: (row: T) => React.Key;

  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  useCustomPagination?: boolean; // Option để bật custom pagination
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  rowKey,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  useCustomPagination = true // Mặc định sử dụng custom
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Validate và normalize các giá trị pagination
  const safePage = typeof page === 'number' && page >= 0 ? page : 0;
  const safePageSize = typeof pageSize === 'number' && pageSize > 0 ? pageSize : 10;
  const safeTotal = typeof total === 'number' && total >= 0 ? total : 0;
  const totalPages = Math.ceil(safeTotal / safePageSize);

  const showPagination = typeof total === 'number' && 
                        typeof page === 'number' && 
                        typeof pageSize === 'number' &&
                        typeof onPageChange === 'function' &&
                        typeof onPageSizeChange === 'function';

  // Custom pagination render
  const renderCustomPagination = () => {
    // Tính toán các trang cần hiển thị
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const currentPage = safePage + 1; // Chuyển sang 1-based để hiển thị

      // Luôn hiển thị trang đầu
      pages.push(1);

      // Logic hiển thị các trang
      if (totalPages <= 10) {
        // Nếu tổng số trang <= 10, hiển thị tất cả
        for (let i = 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Nếu nhiều hơn 10 trang
        if (currentPage <= 4) {
          // Nếu đang ở đầu, hiển thị 1-5 ... last-2 last-1 last
          for (let i = 2; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages - 1);
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          // Nếu đang ở cuối
          pages.push(2);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Nếu đang ở giữa
          pages.push(2);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <PaginationContainer>
        <PageInfo>
          Page {safePage + 1} of {totalPages}
        </PageInfo>

        <IconButton
          size="small"
          onClick={() => onPageChange!(0)}
          disabled={safePage === 0}
          sx={{ color: '#999', '&:disabled': { color: '#555' } }}
        >
          <FirstPage />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange!(safePage - 1)}
          disabled={safePage === 0}
          sx={{ color: '#999', '&:disabled': { color: '#555' } }}
        >
          <NavigateBefore />
        </IconButton>

        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return <span key={`ellipsis-${index}`} style={{ color: '#666', margin: '0 4px' }}>...</span>;
          }
          
          const pageNumber = pageNum as number;
          const pageIndex = pageNumber - 1; // Chuyển về 0-based
          
          return (
            <PageButton
              key={pageNumber}
              active={pageIndex === safePage}
              onClick={() => onPageChange!(pageIndex)}
              size="small"
            >
              {pageNumber}
            </PageButton>
          );
        })}

        <IconButton
          size="small"
          onClick={() => onPageChange!(safePage + 1)}
          disabled={safePage >= totalPages - 1}
          sx={{ color: '#999', '&:disabled': { color: '#555' } }}
        >
          <NavigateNext />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onPageChange!(totalPages - 1)}
          disabled={safePage >= totalPages - 1}
          sx={{ color: '#999', '&:disabled': { color: '#555' } }}
        >
          <LastPage />
        </IconButton>

        <span style={{ marginLeft: '8px', fontSize: '14px', color: '#999' }}>
          Last »
        </span>
      </PaginationContainer>
    );
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} align={col.align || 'left'}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {(data ?? []).map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((col, idx) => (
                  <TableCell key={idx} align={col.align || 'left'}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {(!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && useCustomPagination && renderCustomPagination()}

      {showPagination && !useCustomPagination && (
        <TablePagination
          component="div"
          count={safeTotal}
          page={safePage}
          onPageChange={(_, newPage) => onPageChange!(newPage)}
          rowsPerPage={safePageSize}
          onRowsPerPageChange={(e) => onPageSizeChange!(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      )}
    </Paper>
  );
}

export default DataTable;