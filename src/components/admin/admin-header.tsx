"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person,
  Lock,
  Warning,
  Computer
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from '@/providers/AuthProvider';
import { useNotificationList } from '@/features/notification/useNotificationList';
import { markAsRead } from '@/services/notification.service';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationDto } from '@/types/notification';
import { AdminSidebar } from "./admin-sidebar";

export const AdminHeader: React.FC = () => {
  const { isAuthenticated, user, logout, loading, getSessionDuration, getBrowserSummary } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const open = Boolean(anchorEl);

  // Notification logic
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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialog(true);
    handleMenuClose();
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

  const handleProfile = () => {
    router.push("/profile");
    handleMenuClose();
  };

  const handleSettings = () => {
    router.push("/settings");
    handleMenuClose();
  };

  const handleChangePassword = () => {
    router.push("/change-password");
    handleMenuClose();
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
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "#ffffff",
        color: "#333333",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setOpenSidebar(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: "#1e3a8a",
          }}
        >
          Admin Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton
              color="inherit"
              sx={{ position: "relative", "&:hover": { bgcolor: "rgba(30, 58, 138, 0.08)" } }}
              onClick={handleOpenNotiMenu}
            >
              <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Button
            onClick={handleProfileMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "inherit",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(30, 58, 138, 0.08)" },
            }}
          >
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: "#1e3a8a", fontSize: "0.875rem" }}
            >
              {getUserInitials(user?.name)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {user?.name || "Admin User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.email || "admin"}
              </Typography>
            </Box>
          </Button>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { mt: 1, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } }}
          >
            <MenuItem onClick={handleProfile}>
              <Person sx={{ mr: 2 }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem onClick={handleChangePassword}>
              <Lock sx={{ mr: 2 }} />
              Đổi mật khẩu
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ mr: 2 }} />
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick} sx={{ color: "error.main" }}>
              <LogoutIcon sx={{ mr: 2 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Notification Menu */}
      <Menu
        anchorEl={anchorNoti}
        open={Boolean(anchorNoti)}
        onClose={handleCloseNotiMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, minWidth: 340, maxWidth: 400, maxHeight: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } }}
      >
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Thông báo
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {notifications.length === 0 && (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
              Không có thông báo nào.
            </Typography>
          )}
          {recentNoti.length > 0 && (
            <>
              <Typography variant="caption" sx={{ pl: 2, color: "text.secondary" }}>
                Mới
              </Typography>
              {recentNoti.map((noti) => (
                <MenuItem
                  key={noti.notificationId}
                  onClick={() => handleClickNotification(noti)}
                  selected={selectedNoti?.notificationId === noti.notificationId}
                  sx={{ bgcolor: !noti.readStatus ? "rgba(30,58,138,0.08)" : undefined }}
                >
                  <ListItemText
                    primary={noti.message}
                    secondary={new Date(noti.notificationDate).toLocaleString()}
                  />
                  {!noti.readStatus && <Chip label="Mới" color="error" size="small" />}
                </MenuItem>
              ))}
            </>
          )}
          {olderNoti.length > 0 && (
            <>
              <Typography variant="caption" sx={{ pl: 2, color: "text.secondary" }}>
                Cũ hơn
              </Typography>
              {olderNoti.map((noti) => (
                <MenuItem
                  key={noti.notificationId}
                  onClick={() => handleClickNotification(noti)}
                  selected={selectedNoti?.notificationId === noti.notificationId}
                  sx={{ bgcolor: !noti.readStatus ? "rgba(30,58,138,0.04)" : undefined }}
                >
                  <ListItemText
                    primary={noti.message}
                    secondary={new Date(noti.notificationDate).toLocaleString()}
                  />
                  {!noti.readStatus && <Chip label="Mới" color="error" size="small" />}
                </MenuItem>
              ))}
            </>
          )}
        </Box>
      </Menu>

      {/* Sidebar cho admin */}
      <AdminSidebar 
        open={openSidebar} 
        onClose={() => setOpenSidebar(false)} 
        currentUser={user && user.name ? { full_name: user.name, username: user.email || "admin" } : undefined} 
      />

      {/* LOGOUT CONFIRMATION DIALOG */}
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
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
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
          <Button onClick={handleLogoutConfirm} color="error" disabled={logoutLoading} startIcon={logoutLoading ? <CircularProgress size={18} /> : <LogoutIcon />}>
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
