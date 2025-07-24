'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar,
  Menu, MenuItem, Divider, ListItemIcon, ListItemText, Chip,
  useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Tooltip, Badge
} from '@mui/material';

import {
  Menu as MenuIcon, Lock, Logout,
  Person, Login, Warning, Notifications as NotificationsIcon
} from '@mui/icons-material';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useNotificationList } from '@/features/notification/useNotificationList';
import { useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '@/services/notification.service';
import { NotificationDto } from '@/types/notification';

const Header: React.FC = () => {
  const {
    isAuthenticated, user, logout, loading,
  } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const open = Boolean(anchorEl);
  const [anchorNoti, setAnchorNoti] = useState<null | HTMLElement>(null);
  const [selectedNoti, setSelectedNoti] = useState<NotificationDto | null>(null);
  const queryClient = useQueryClient();

  const handleOpenNotiMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorNoti(e.currentTarget);
  };
  const handleCloseNotiMenu = () => {
    setAnchorNoti(null);
  };

  const { data: notifications = [] } = useNotificationList();
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const recentNoti = notifications.filter(n => {
    const date = new Date(n.notificationDate);
    return Date.now() - date.getTime() < 1000 * 60 * 60 * 24;
  });
  const olderNoti = notifications.filter(n => {
    const date = new Date(n.notificationDate);
    return Date.now() - date.getTime() >= 1000 * 60 * 60 * 24;
  });

  const handleClickNotification = async (noti: NotificationDto) => {
    try {
      if (!noti.readStatus) {
        await markAsRead(noti.notificationId);
        queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
      }
      setSelectedNoti(noti);
      handleCloseNotiMenu();
    } catch (error) {
      console.error('Đánh dấu đã đọc thất bại:', error);
    }
  };

  if (loading) return null;

  const handleLogin = () => router.push('/auth/login');
  const handleProfile = () => {
    router.push('/profile');
    handleCloseMenu();
  };
  const handleChangePassword = () => {
    router.push('/change-password');
    handleCloseMenu();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialog(true);
    handleCloseMenu();
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
      setLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialog(false);
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case '1': return 'error';
      case 'staff':
      case '2': return 'warning';
      case 'user':
      case '3': return 'info';
      default: return 'default';
    }
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <IconButton edge="start" color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              onClick={() => router.push('/')}
            >
              MyApp
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Thông báo">
                <IconButton onClick={handleOpenNotiMenu}>
                  <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                    <NotificationsIcon sx={{ color: 'white' }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                    {user?.name}
                  </Typography>
                  {user?.role && (
                    <Chip
                      label={user.role}
                      size="small"
                      color={getRoleColor(user.role) as any}
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Box>

              <IconButton onClick={handleMenuClick}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {getUserInitials(user?.name)}
                </Avatar>
              </IconButton>

              <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  Trang cá nhân
                </MenuItem>
                <MenuItem onClick={handleChangePassword}>
                  <ListItemIcon><Lock fontSize="small" /></ListItemIcon>
                  Đổi mật khẩu
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={handleLogin} startIcon={<Login />}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>


      <Menu
        anchorEl={anchorNoti}
        open={Boolean(anchorNoti)}
        onClose={handleCloseNotiMenu}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 480,
            px: 1,
            py: 1
          }
        }}

      >
        <Box px={1.5} py={1}>
          <Typography variant="h6" fontWeight={600}>Thông báo</Typography>
          <Button
            size="small"
            onClick={() => {
              router.push('/notification');
              handleCloseNotiMenu();
            }}
            sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 500 }}
          >
            Xem tất cả
          </Button>

          <Typography variant="subtitle2" color="text.secondary" mt={1}>
            Gần đây
          </Typography>
          {recentNoti.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Không có thông báo mới
            </Typography>
          )}
          {recentNoti.map(n => (
            <MenuItem
              key={n.notificationId}
              onClick={() => handleClickNotification(n)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                bgcolor: n.readStatus ? 'grey.100' : 'rgba(25, 118, 210, 0.1)',
                mb: 1,
                borderRadius: 1.5,
                py: 1.5,
                px: 2,
                boxShadow: n.readStatus ? undefined : 2,
                '&:hover': {
                  bgcolor: n.readStatus ? 'grey.200' : 'rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {n.notificationType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {n.message || 'Không rõ nội dung'}
              </Typography>
              <Typography variant="caption" color="text.disabled" alignSelf="flex-end">
                {new Date(n.notificationDate).toLocaleString()}
              </Typography>
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Trước đó
          </Typography>
          {olderNoti.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Không có thông báo cũ
            </Typography>
          )}
          {olderNoti.map(n => (
            <MenuItem
              key={n.notificationId}
              onClick={() => handleClickNotification(n)}
              sx={{
                bgcolor: !n.readStatus ? 'rgba(25, 118, 210, 0.08)' : 'grey.100',
                borderRadius: 1,
                mb: 1,
                alignItems: 'flex-start', // fix text overflow alignment
                whiteSpace: 'normal',     // ✅ allow text wrapping
                wordBreak: 'break-word',  // ✅ wrap long words
                maxWidth: '100%',
                px: 2,
                py: 1.5
              }}
            >
              <ListItemText
                primary={
                  <Typography fontWeight={600} fontSize="0.85rem" noWrap={false}>
                    {n.notificationType}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word', mb: 0.5 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.notificationDate).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </MenuItem>

          ))}

          <Box mt={2} textAlign="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                router.push('/notification');
                handleCloseNotiMenu();
              }}
            >
              Xem tất cả
            </Button>
          </Box>
        </Box>
      </Menu>


      <Dialog open={!!selectedNoti} onClose={() => setSelectedNoti(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết thông báo</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" fontWeight={600}>
            {selectedNoti?.notificationType}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Ngày gửi: {selectedNoti && new Date(selectedNoti.notificationDate).toLocaleString()}
          </Typography>
          <Typography variant="body1" mt={2}>
            {selectedNoti?.message || 'Không có nội dung chi tiết'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNoti(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoutDialog} onClose={handleLogoutCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Xác nhận đăng xuất
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn đăng xuất khỏi thiết bị này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} disabled={logoutLoading}>Hủy</Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" disabled={logoutLoading} startIcon={logoutLoading ? <CircularProgress size={16} /> : <Logout />}>
            {logoutLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
