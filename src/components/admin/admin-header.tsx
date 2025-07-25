"use client";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
  currentUser?: {
    full_name: string;
    username: string;
  };
  pageTitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuClick,
  currentUser,
  pageTitle = "Admin Dashboard",
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    // Handle logout logic here
    console.log("Logout clicked");
    router.push("/auth/login");
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push("/settings");
  };

  const isMenuOpen = Boolean(anchorEl);

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
          onClick={onMenuClick}
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
          {pageTitle}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          {isMounted && (
            <IconButton
              color="inherit"
              sx={{
                position: "relative",
                "&:hover": {
                  bgcolor: "rgba(30, 58, 138, 0.08)",
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}

          {/* User Profile */}
          {isMounted && (
            <Button
              onClick={handleProfileMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "inherit",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(30, 58, 138, 0.08)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#1e3a8a",
                  fontSize: "0.875rem",
                }}
              >
                {currentUser?.full_name?.charAt(0) || "A"}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {currentUser?.full_name || "Admin User"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {currentUser?.username || "admin"}
                </Typography>
              </Box>
            </Button>
          )}

          {/* Profile Menu */}
          {isMounted && (
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <SettingsIcon sx={{ mr: 2 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <LogoutIcon sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
