'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import {
  AdminResetPasswordRequestDTO,
  AdminUpdateUserRequestDTO,
  CreateUserRequestDTO,
  User
} from './user.types';

export function useUserManagement() {
  const { token, loading: authLoading } = useAuth();
  
  // Tách biệt allUsers và currentPageData
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentPageData, setCurrentPageData] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogStates, setDialogStates] = useState({
    create: false,
    edit: false,
    resetPassword: false,
    delete: false
  });
  
  // 0-based page cho TablePagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // ✅ Đổi tên để rõ ràng hơn
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isUsingFilter, setIsUsingFilter] = useState(false);
  
  // New state for role filter
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Debug: Log khi các state quan trọng thay đổi
  console.log('🔍 Current state:', {
    page,
    pageSize,
    totalCount,
    allUsersLength: allUsers.length,
    currentPageDataLength: currentPageData.length,
    isUsingFilter,
    searchKeyword,
    selectedRole
  });

  // Cập nhật currentPageData khi allUsers, page, pageSize thay đổi
  useEffect(() => {
    console.log('📊 useEffect [allUsers, page, pageSize] triggered');
    
    const safePage = page >= 0 ? page : 0;
    const startIndex = safePage * pageSize;
    const endIndex = startIndex + pageSize;
    
    setCurrentPageData(allUsers.slice(startIndex, endIndex));
  }, [allUsers, page, pageSize]);

  useEffect(() => {
    console.log('🔄 useEffect [authLoading, token, searchKeyword, isUsingFilter, selectedRole] triggered');
    loadUsers();
  }, [authLoading, token, searchKeyword, isUsingFilter, selectedRole]);

  useEffect(() => {
    console.log('📐 useEffect [totalCount, pageSize] triggered');
    
    // Chỉ thực hiện logic nếu totalCount đã được xác định và pageSize hợp lệ
    if (totalCount >= 0 && pageSize > 0) {
      // Tính toán trang cuối cùng hợp lệ (chỉ số 0-based)
      const lastPageIndex = Math.max(0, Math.ceil(totalCount / pageSize) - 1);
      
      // Nếu trang hiện tại lớn hơn trang cuối cùng (do dữ liệu đã thay đổi),
      // thì tự động quay về trang cuối cùng hợp lệ.
      if (page > lastPageIndex) {
        console.log('  ⚠️ Page out of bounds! Resetting to lastPageIndex:', lastPageIndex);
        setPage(lastPageIndex);
      }
    } else {
      // Nếu không có dữ liệu, luôn đảm bảo trang là 0
      if (page !== 0) {
        console.log('  ⚠️ No data, resetting page to 0');
        setPage(0);
      }
    }
  }, [totalCount, pageSize, page]); 

  // ✅ Sửa lại buildFilterQuery để nhận keyword thay vì OData query
  const buildFilterQuery = (keyword: string, roleFilter: number | null) => {
    const filters = [];
    
    if (keyword) {
      const safe = keyword.toLowerCase().replace(/'/g, "''");
      filters.push(`(contains(tolower(fullName),'${safe}') or contains(tolower(email),'${safe}') or contains(tolower(phone), '${safe}') or contains(tolower(address), '${safe}'))`);
    }
    
    if (roleFilter !== null) {
      const roleName = getRoleName(roleFilter);
      filters.push(`roleName eq '${roleName}'`);
    }
    
    return filters.length > 0 ? filters.join(' and ') : '';
  };

  const loadUsers = async () => {
    console.log('🚀 loadUsers called');
    
    if (!token) {
      console.log('  ❌ No token, skipping load');
      return;
    }
    
    setLoading(true);
    try {
      // ✅ Truyền searchKeyword thay vì filter
      const combinedFilter = buildFilterQuery(searchKeyword, selectedRole);
      
      if (combinedFilter) {
        console.log('  📝 Loading with filter:', combinedFilter);
        const odataQuery = `$filter=${combinedFilter}&$count=true`;
        const result = await userService.getUsersByOData(token, odataQuery);
        const mappedUsers = result.users.map((u) => ({ ...u, id: u.userId }));
        
        setAllUsers(mappedUsers);
        setTotalCount(mappedUsers.length);
      } else {
        console.log('  📝 Loading all users');
        const allUsersResult = await userService.getAllUsers(token);
        const mappedUsers = allUsersResult.map((u) => ({ ...u, id: u.userId }));
        
        setAllUsers(mappedUsers);
        setTotalCount(mappedUsers.length);
      }
    } catch (err) {
      console.error('  ❌ Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequestDTO) => {
    console.log('➕ handleCreateUser called');
    if (!token) return;
    await userService.createUser(token, userData);
    await loadUsers();
    handleCloseDialogs();
  };

  const handleUpdateUser = async (userData: AdminUpdateUserRequestDTO) => {
    console.log('✏️ handleUpdateUser called');
    if (!token) return;
    await userService.updateUser(token, userData);
    await loadUsers();
    handleCloseDialogs();
  };

  const handleResetPassword = async (resetData: AdminResetPasswordRequestDTO) => {
    console.log('🔐 handleResetPassword called');
    if (!token) return;
    await userService.resetPassword(token, resetData);
    handleCloseDialogs();
  };

  const handleDeleteUser = async () => {
    console.log('🗑️ handleDeleteUser called');
    if (!token || !selectedUser) return;
    await userService.deleteUser(token, selectedUser.userId);
    await loadUsers();
    handleCloseDialogs();
  };

  const handleOpenCreateDialog = () => setDialogStates({ ...dialogStates, create: true });
  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setDialogStates({ ...dialogStates, edit: true });
  };
  const handleOpenResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setDialogStates({ ...dialogStates, resetPassword: true });
  };
  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDialogStates({ ...dialogStates, delete: true });
  };
  const handleCloseDialogs = () => {
    setDialogStates({ create: false, edit: false, resetPassword: false, delete: false });
    setSelectedUser(null);
  };

  // Handlers cho client-side pagination
  const handlePageChange = (newPage: number) => {
    console.log('📄 handlePageChange called:', {
      currentPage: page,
      newPage,
      safeNewPage: Math.max(newPage, 0)
    });
    setPage(Math.max(newPage, 0));
  };

  const handlePageSizeChange = (newSize: number) => {
    console.log('📏 handlePageSizeChange called:', {
      currentPageSize: pageSize,
      newSize,
      resettingPageTo: 0
    });
    setPageSize(newSize);
    setPage(0);
  };

  // ✅ Sửa lại applyFilter để lưu keyword thay vì OData query
  const applyFilter = (keyword: string) => {
    console.log('🔍 applyFilter called with keyword:', keyword);
    
    if (!keyword) {
      console.log('  - Clearing text filter');
      setIsUsingFilter(false);
      setSearchKeyword('');
      setPage(0);
      return;
    }

    console.log('  - Setting search keyword:', keyword);
    setSearchKeyword(keyword);
    setIsUsingFilter(true);
    setPage(0);
  };

  const applyRoleFilter = (roleId: number | null) => {
    console.log('🎭 applyRoleFilter called with roleId:', roleId);
    setSelectedRole(roleId);
    setPage(0);
  };

  const clearAllFilters = () => {
    console.log('🧹 clearAllFilters called');
    setSearchKeyword('');
    setIsUsingFilter(false);
    setSelectedRole(null);
    setPage(0);
  };

  const getRoleName = (roleId: number): string => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Staff';
      case 3: return 'User';
      default: return 'Unknown';
    }
  };

  return {
    users: currentPageData,
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
    setPage: handlePageChange,
    handlePageSizeChange,
    // ✅ Đổi tên để rõ ràng hơn
    searchKeyword,
    isUsingFilter,
    applyFilter,
    selectedRole,
    applyRoleFilter,
    clearAllFilters,
    getRoleName,
  };
}