'use client';
import React from 'react';
import DataTable from '@/components/table/DataTable';
import { IconButton, Chip, Stack, Tooltip } from '@mui/material';
import { Edit, Delete, VpnKey } from '@mui/icons-material';
import { User } from './user.types';

interface Props {
  users: User[];
  loading: boolean;
  error: string | null;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Helper functions for role display
const getRoleColor = (roleName: string) => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
      return 'error' as const;
    case 'staff':
      return 'warning' as const;
    case 'user':
      return 'info' as const;
    default:
      return 'default' as const;
  }
};

const getRoleColorById = (roleId: number) => {
  switch (roleId) {
    case 1:
      return 'error' as const;
    case 2:
      return 'warning' as const;
    case 3:
      return 'info' as const;
    default:
      return 'default' as const;
  }
};

const getRoleNameById = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'Admin';
    case 2: return 'Staff';
    case 3: return 'User';
    default: return 'Unknown';
  }
};

const UserTable: React.FC<Props> = ({
  users,
  loading,
  error,
  onEdit,
  onResetPassword,
  onDelete,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange
}) => {
  // Debug: Log props nhận được
  console.log('🔵 UserTable props:', {
    usersLength: users?.length,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    hasOnPageChange: !!onPageChange,
    hasOnPageSizeChange: !!onPageSizeChange
  });

  const columns = [
    { 
      key: 'userId', 
      label: 'ID',
      align: 'center' as const,
      render: (user: User) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          #{user.userId}
        </span>
      )
    },
    { key: 'username', label: 'Tên đăng nhập' },
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Họ và tên' },
    { 
      key: 'phone', 
      label: 'Số điện thoại',
      render: (user: User) => user.phone || '-'
    },
    { 
      key: 'address', 
      label: 'Địa chỉ',
      render: (user: User) => user.address || '-'
    },
    {
      key: 'role',
      label: 'Vai trò',
      align: 'center' as const,
      render: (user: User) => {
        // Ưu tiên sử dụng roleId nếu có, fallback về roleName
        const roleColor = user.roleId 
          ? getRoleColorById(user.roleId)
          : getRoleColor(user.roleName);
        
        const displayName = user.roleId 
          ? getRoleNameById(user.roleId)
          : user.roleName;

        return (
          <Chip
            label={displayName}
            color={roleColor}
            size="small"
            variant="filled"
            sx={{ 
              fontWeight: 'bold',
              minWidth: '70px'
            }}
          />
        );
      }
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      align: 'center' as const,
      render: (user: User) => (
        <Chip
          label={user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          color={user.isActive ? 'success' : 'error'}
          size="small"
          variant={user.isActive ? 'filled' : 'outlined'}
          sx={{ 
            fontWeight: 'bold',
            minWidth: '90px'
          }}
        />
      )
    },
    {
      key: 'createDate',
      label: 'Ngày tạo',
      align: 'center' as const,
      render: (user: User) => {
        if (!user.createDate) return '-';
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(user.createDate));
      }
    },
    {
      key: 'actions',
      label: 'Hành động',
      align: 'center' as const,
      render: (user: User) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Chỉnh sửa thông tin">
            <IconButton
              size="small"
              onClick={() => onEdit(user)}
              color="primary"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'primary.light', 
                  color: 'white' 
                } 
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Đặt lại mật khẩu">
            <IconButton
              size="small"
              onClick={() => onResetPassword(user)}
              color="warning"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'warning.light', 
                  color: 'white' 
                } 
              }}
            >
              <VpnKey fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Xóa người dùng">
            <IconButton
              size="small"
              onClick={() => onDelete(user)}
              color="error"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'error.light', 
                  color: 'white' 
                } 
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // Debug: Log trước khi render
  console.log('🔵 UserTable rendering with:', {
    dataLength: (users || []).length,
    page,
    pageSize,
    total: totalCount
  });

  return (
    <DataTable
      data={users || []}
      columns={columns}
      loading={loading}
      error={error}
      rowKey={(user) => `user-${user.userId}`}
      page={page}
      pageSize={pageSize}
      total={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
};

export default UserTable;