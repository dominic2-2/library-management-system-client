'use client';

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Menu, 
  MenuItem, 
  Chip, 
  Stack,
  Typography,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface UserFilterProps {
  onApplyFilter: (keyword: string) => void;
  onApplyRoleFilter?: (roleId: number | null) => void;
  onClearAllFilters?: () => void;
  selectedRole?: number | null;
  isLoading: boolean;
  hasTextFilter?: boolean;
}

const ROLES = [
  { id: 1, name: 'Admin', color: 'error' as const },
  { id: 2, name: 'Staff', color: 'warning' as const },
  { id: 3, name: 'User', color: 'info' as const }
];

const getRoleName = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'Admin';
    case 2: return 'Staff';
    case 3: return 'User';
    default: return 'Unknown';
  }
};

const UserFilter: React.FC<UserFilterProps> = ({ 
  onApplyFilter, 
  onApplyRoleFilter,
  onClearAllFilters,
  selectedRole = null,
  isLoading,
  hasTextFilter = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const isRoleMenuOpen = Boolean(roleMenuAnchor);

  const handleSearch = () => {
    const keyword = searchText.trim().replace(/'/g, '');
    if (!keyword) return;
    onApplyFilter(keyword);
  };

  const handleClearSearch = () => {
    setSearchText('');
    onApplyFilter('');
  };

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRoleMenuAnchor(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null);
  };

  const handleRoleSelect = (roleId: number | null) => {
    if (onApplyRoleFilter) {
      onApplyRoleFilter(roleId);
    }
    handleRoleMenuClose();
  };

  const hasAnyFilter = selectedRole !== null || hasTextFilter;

  return (
    <Box mb={2}>
      {/* Main Search and Filter Row */}
      <Stack direction="row" spacing={2} alignItems="center" mb={hasAnyFilter ? 2 : 0}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Tìm kiếm theo tên hoặc email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          disabled={isLoading}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          Tìm
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ClearIcon />}
          onClick={handleClearSearch}
          disabled={isLoading || !searchText}
          sx={{ minWidth: 100 }}
        >
          Xóa
        </Button>

        {/* Role Filter Button */}
        {onApplyRoleFilter && (
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleRoleMenuOpen}
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              minWidth: 140,
              justifyContent: 'space-between',
              borderColor: selectedRole ? 'primary.main' : 'grey.400',
              color: selectedRole ? 'primary.main' : 'text.primary'
            }}
          >
            {selectedRole ? getRoleName(selectedRole) : 'Vai trò'}
          </Button>
        )}

        {/* Role Menu */}
        <Menu
          anchorEl={roleMenuAnchor}
          open={isRoleMenuOpen}
          onClose={handleRoleMenuClose}
          PaperProps={{
            sx: { minWidth: 180 }
          }}
        >
          <MenuItem onClick={() => handleRoleSelect(null)}>
            <Typography 
              color={selectedRole === null ? 'primary' : 'inherit'}
              fontWeight={selectedRole === null ? 'bold' : 'normal'}
            >
              Tất cả vai trò
            </Typography>
          </MenuItem>
          
          <Divider />
          
          {ROLES.map((role) => (
            <MenuItem 
              key={role.id} 
              onClick={() => handleRoleSelect(role.id)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: selectedRole === role.id ? 'action.selected' : 'transparent'
              }}
            >
              <Chip
                label={role.name}
                color={role.color}
                size="small"
                variant={selectedRole === role.id ? 'filled' : 'outlined'}
              />
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      {/* Active Filters Display */}
      {hasAnyFilter && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Bộ lọc đang áp dụng:
          </Typography>
          
          {selectedRole && (
            <Chip
              label={`Vai trò: ${getRoleName(selectedRole)}`}
              color="primary"
              size="small"
              onDelete={() => onApplyRoleFilter && onApplyRoleFilter(null)}
              deleteIcon={<ClearIcon />}
              sx={{ mr: 1 }}
            />
          )}
          
          {hasTextFilter && (
            <Chip
              label="Tìm kiếm văn bản"
              color="secondary"
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          
          {onClearAllFilters && (
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<ClearIcon />}
              onClick={onClearAllFilters}
              disabled={isLoading}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.75rem',
                minWidth: 'auto',
                ml: 1
              }}
            >
              Xóa tất cả
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default UserFilter;