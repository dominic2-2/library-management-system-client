'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Container, Paper, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUserManagement } from '@/features/user/useUserManagement';
import UserTable from '@/features/user/UserTable';
import CreateUserDialog from '@/features/user/CreateUserDialog';
import EditUserDialog from '@/features/user/EditUserDialog';
import ResetPasswordDialog from '@/features/user/ResetPasswordDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuth } from '@/providers/AuthProvider';
import UserFilter from '@/features/user/UserFilter';

const UserManagementPage = () => {
  const {
    users,
    loading,
    error,
    selectedUser,
    dialogStates,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleOpenResetPasswordDialog,
    handleOpenDeleteDialog,
    handleCloseDialogs,
    handleCreateUser,
    handleUpdateUser,
    handleResetPassword,
    handleDeleteUser,
    page,
    pageSize,
    totalCount,
    setPage,
    handlePageSizeChange,
    applyFilter,
    // Role filter props from updated hook
    selectedRole,
    applyRoleFilter,
    clearAllFilters,
    getRoleName,
    isUsingFilter
  } = useUserManagement();

  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (!authLoading) {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'Admin') {
      router.push('/not-authorized'); // hoặc hiện dialog lỗi
    }
  }
}, [authLoading, isAuthenticated, user]);

  if (authLoading || !isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" gap={2}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Đang xác thực tài khoản...
        </Typography>
      </Box>
    );
  }

  // Debug: Log state
  console.log('🟡 UserManagementPage state:', {
    page_from_hook: page,
    pageSize,
    totalCount,
    usersLength: users?.length,
    totalPages: Math.ceil(totalCount / pageSize),
    selectedRole,
    isUsingFilter
  });

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  // Handler cho TablePagination (0-based)
  const handleTablePageChange = (newPage: number) => {
    console.log('🟡 TablePagination onChange:', {
      currentPage_0based: page,
      newPage_0based: newPage
    });
    setPage(newPage);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Quản lý người dùng</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Thêm người dùng
          </Button>
        </Box>
        
        {/* Updated UserFilter with role filter support */}
        <UserFilter 
          onApplyFilter={applyFilter}
          onApplyRoleFilter={applyRoleFilter}
          onClearAllFilters={clearAllFilters}
          selectedRole={selectedRole}
          isLoading={loading}
          hasTextFilter={isUsingFilter}
        />

        <UserTable
          users={users}
          loading={loading}
          error={error}
          onEdit={handleOpenEditDialog}
          onResetPassword={handleOpenResetPasswordDialog}
          onDelete={handleOpenDeleteDialog}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handleTablePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Filter Summary */}
        {(selectedRole || isUsingFilter) && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="body2" color="text.secondary">
              📊 <strong>Kết quả:</strong> Đang hiển thị {users.length} / {totalCount} người dùng
              {selectedRole && (
                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {' '}với vai trò "{getRoleName(selectedRole)}"
                </span>
              )}
              {isUsingFilter && (
                <span style={{ color: '#ed6c02', fontWeight: 'bold' }}>
                  {' '}khớp từ khóa tìm kiếm
                </span>
              )}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <CreateUserDialog
        open={dialogStates.create}
        onClose={handleCloseDialogs}
        onSubmit={handleCreateUser}
      />

      <EditUserDialog
        open={dialogStates.edit}
        user={selectedUser}
        onClose={handleCloseDialogs}
        onSubmit={handleUpdateUser}
      />

      <ResetPasswordDialog
        open={dialogStates.resetPassword}
        user={selectedUser}
        onClose={handleCloseDialogs}
        onSubmit={handleResetPassword}
      />

      <ConfirmDialog
        open={dialogStates.delete}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.fullName}" không?`}
        onClose={handleCloseDialogs}
        onConfirm={handleDeleteUser}
      />
    </Container>
  );
};

export default UserManagementPage;