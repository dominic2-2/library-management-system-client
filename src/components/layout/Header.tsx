'use client';

//the
import { useNotificationList } from '@/features/notification/useNotificationList';
import { markAsRead } from '@/services/notification.service';
import { useQueryClient } from '@tanstack/react-query';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import { NotificationDto } from '@/types/notification';
// ✅ Import necessary components and types

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Lock,
  Logout,
  Person,
  Login,
  Warning,
  Computer
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import Sidebar from './Sidebar';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, loading, getSessionDuration, getBrowserSummary } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const open = Boolean(anchorEl);

  //the
  const [anchorNoti, setAnchorNoti] = useState<null | HTMLElement>(null);
  const [selectedNoti, setSelectedNoti] = useState<NotificationDto | null>(null);
  const queryClient = useQueryClient();
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
  const handleOpenNotiMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorNoti(e.currentTarget);
  };

  const handleCloseNotiMenu = () => {
    setAnchorNoti(null);
  };

  const handleClickNotification = async (noti: NotificationDto) => {
    try {
      if (!noti.readStatus) {
        await markAsRead(noti.notificationId);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
      setSelectedNoti(noti);
      handleCloseNotiMenu();
    } catch (error) {
      console.error('Đánh dấu đã đọc thất bại:', error);
    }
  };

  const [openSidebar, setOpenSidebar] = useState(false);


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

  // ✅ ENHANCED: Logout with confirmation and loading
  const handleLogoutClick = () => {
    setLogoutDialog(true);
    handleCloseMenu();
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);

    try {
      await logout(); // ✅ Now calls server API
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with logout even if API fails
    } finally {
      setLogoutLoading(false);
      setLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialog(false);
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color
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
          {/* Logo / Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <IconButton
              edge="start"
              color="inherit"
              sx={{
                mr: 1,
                background: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2)
                }
              }}
              onClick={() => setOpenSidebar(true)}
            >
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
                WebkitTextFillColor: 'transparent',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease'
                }
              }}
              onClick={() => router.push('/user/home')}
            >
              MyApp
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Actions */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Info */}
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
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Tooltip title="Thông báo">
                <IconButton onClick={handleOpenNotiMenu}>
                  <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                    <NotificationsIcon sx={{ color: 'white' }} />
                  </Badge>
                </IconButton>
              </Tooltip>


              {/* User Avatar & Menu */}
              <IconButton
                onClick={handleMenuClick}
                sx={{
                  p: 0,
                  ml: 1,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  '&:hover': {
                    border: `2px solid ${alpha(theme.palette.common.white, 0.7)}`,
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.secondary.main,
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  {getUserInitials(user?.name)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorNoti}
                open={Boolean(anchorNoti)}
                onClose={handleCloseNotiMenu}
                PaperProps={{ sx: { width: 400, maxHeight: 480, px: 1, py: 1 } }}
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

                  <Typography variant="subtitle2" color="text.secondary" mt={1}>Gần đây</Typography>
                  {recentNoti.length === 0 && <Typography variant="body2">Không có thông báo mới</Typography>}
                  {recentNoti.map(n => (
                    <MenuItem
                      key={n.notificationId}
                      onClick={() => handleClickNotification(n)}
                      sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        bgcolor: n.readStatus ? 'grey.100' : 'rgba(25, 118, 210, 0.1)',
                        mb: 1, borderRadius: 1.5, py: 1.5, px: 2, boxShadow: n.readStatus ? undefined : 2
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>{n.notificationType}</Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'normal',        // Cho phép xuống dòng
                          wordBreak: 'break-word',     // Tự ngắt từ dài
                          overflowWrap: 'break-word',  // Đảm bảo không tràn
                          color: 'text.secondary'
                        }}
                      >
                        {n.message || 'Không rõ nội dung'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" alignSelf="flex-end">
                        {new Date(n.notificationDate).toLocaleString()}
                      </Typography>
                    </MenuItem>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">Trước đó</Typography>
                  {olderNoti.length === 0 && <Typography variant="body2">Không có thông báo cũ</Typography>}
                  {olderNoti.map(n => (
                    <MenuItem
                      key={n.notificationId}
                      onClick={() => handleClickNotification(n)}
                      sx={{
                        bgcolor: !n.readStatus ? 'rgba(25, 118, 210, 0.08)' : 'grey.100',
                        borderRadius: 1, mb: 1, alignItems: 'flex-start',
                        whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%',
                        px: 2, py: 1.5
                      }}
                    >
                      <ListItemText
                        primary={<Typography fontWeight={600} fontSize="0.85rem" noWrap={false}>{n.notificationType}</Typography>}
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 0.5 }}>{n.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(n.notificationDate).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </MenuItem>
                  ))}
                </Box>
              </Menu>


              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    mt: 1.5,
                    minWidth: 280, // ✅ Wider for session info
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info in Menu */}
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>

                  {/* ✅ Session Info */}
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Chip
                      icon={<Computer />}
                      label={getBrowserSummary()}
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      🕐 Session: {getSessionDuration()}
                    </Typography>
                  </Box>

                  {user?.role && (
                    <Chip
                      label={user.role}
                      size="small"
                      color={getRoleColor(user.role) as any}
                      sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>

                <Divider />

                {/* Menu Items */}
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Person fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Trang cá nhân
                    </Typography>
                  </ListItemText>
                </MenuItem>

                <MenuItem onClick={handleChangePassword} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Lock fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Đổi mật khẩu
                    </Typography>
                  </ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5, color: 'error.main' }}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Đăng xuất
                    </Typography>
                  </ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={handleLogin}
              startIcon={<Login />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: alpha(theme.palette.common.white, 0.1),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                fontWeight: 600,
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} userRole={user?.role} />

      {/* ✅ LOGOUT CONFIRMATION DIALOG */}
      <Dialog
        open={logoutDialog}
        onClose={handleLogoutCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Xác nhận đăng xuất
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Bạn có chắc muốn đăng xuất khỏi thiết bị này?
          </Typography>

          {/* Session Info */}
          {user && (
            <Box sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thông tin phiên hiện tại:
              </Typography>
              <Typography variant="body2">
                👤 {user.name}
              </Typography>
              <Typography variant="body2">
                🕐 {getSessionDuration()}
              </Typography>
              <Typography variant="body2">
                🌐 {getBrowserSummary()}
              </Typography>
              <Typography variant="body2">
                📍 {user.ipAddress}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} disabled={logoutLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
            disabled={logoutLoading}
            startIcon={logoutLoading ? <CircularProgress size={16} /> : <Logout />}
          >
            {logoutLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </DialogActions>
      </Dialog>

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

    </>
  );
};

export default Header;