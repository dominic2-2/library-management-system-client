"use client";

import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  Badge,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Autorenew as AutorenewIcon,
  Autorenew as CirculationIcon,
  PowerSettingsNew as LogoutIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentUser?: {
    full_name: string;
    username: string;
  };
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Library Books",
    icon: <MenuBookIcon />,
    path: "/book/manage",
  },
  {
    text: "Register Books",
    icon: <PersonAddIcon />,
    path: "/book/register",
  },
  {
    text: "View Books",
    icon: <VisibilityIcon />,
    path: "/book/view",
  },
  {
    text: "Library Members",
    icon: <GroupIcon />,
    path: "/user/members",
  },
  {
    text: "Book Requests",
    icon: <AssignmentIcon />,
    path: "/reservation",
  },
  {
    text: "Library Info",
    icon: <InfoIcon />,
    path: "/info",
  },
  {
    text: "Books Categories",
    icon: <CategoryIcon />,
    path: "/book/categories",
  },
  {
    text: "Loan Re-new",
    icon: <AutorenewIcon />,
    path: "/loan/renew",
    badge: 0,
  },
  {
    text: "Book Circulation",
    icon: <CirculationIcon />,
    path: "/book/circulation",
  },
];

const DRAWER_WIDTH = 280;

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  currentUser,
}) => {
  const router = useRouter();

  const handleNavigation = (path: string): void => {
    router.push(path);
    onClose();
  };

  const handleLogout = (): void => {
    // Handle logout logic here
    console.log("Logout clicked");
    router.push("/auth/login");
  };

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        bgcolor: "#2c5aa0",
        color: "white",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
          Limas App
        </Typography>
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            mx: "auto",
            mb: 1,
            bgcolor: "rgba(255,255,255,0.2)",
          }}
        >
          {currentUser?.full_name?.charAt(0) || "B"}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {currentUser?.full_name || "Bwire Mashauri"}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Profile
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, ml: 2 }}>
          Logout
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                px: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
                color: "white",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.badge !== undefined ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button at Bottom */}
      <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              px: 2,
              py: 1.5,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
              },
              color: "white",
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: DRAWER_WIDTH,
          border: "none",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
