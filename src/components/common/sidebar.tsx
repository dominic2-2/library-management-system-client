"use client";

import React, { useState } from "react";
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
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  LibraryBooks as LibraryBooksIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Autorenew as AutorenewIcon,
  Autorenew as CirculationIcon,
  PowerSettingsNew as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Book as BookIcon,
  Style as StyleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

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
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Library Books",
    icon: <LibraryBooksIcon />,
    path: "/book/manage",
    children: [
      {
        text: "Book",
        icon: <MenuBookIcon />,
        path: "/dashboard/admin/book",
      },
      {
        text: "Book Copy",
        icon: <MenuBookIcon />,
        path: "/dashboard/admin/book-copy",
      },
    ],
  },
  {
    text: "Book Attributes",
    icon: <CategoryIcon />,
    path: "/dashboard/admin/book-attributes",
    children: [
      {
        text: "Categories",
        icon: <CategoryIcon />,
        path: "/dashboard/admin/book-attributes/categories",
      },
      {
        text: "Cover Types",
        icon: <StyleIcon />,
        path: "/dashboard/admin/book-attributes/cover-types",
      },
      {
        text: "Paper Qualities",
        icon: <DescriptionIcon />,
        path: "/dashboard/admin/book-attributes/paper-qualities",
      },
      {
        text: "Publishers",
        icon: <BusinessIcon />,
        path: "/dashboard/admin/book-attributes/publishers",
      },
    ],
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
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleNavigation = (path: string): void => {
    router.push(path);
    onClose();
  };

  const handleToggleExpand = (itemText: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemText)) {
      newExpanded.delete(itemText);
    } else {
      newExpanded.add(itemText);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path));
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
        {menuItems.map((item) => {
          const isItemActive = isActive(item.path);
          const isChildActive = hasActiveChild(item);
          const shouldBeExpanded =
            expandedItems.has(item.text) || isChildActive;

          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.children) {
                      handleToggleExpand(item.text);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                    color: "white",
                    bgcolor:
                      isItemActive || isChildActive
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
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
                      fontWeight: isItemActive || isChildActive ? 600 : 400,
                    }}
                  />
                  {item.children &&
                    (shouldBeExpanded ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {/* Render children if item has children */}
              {item.children && (
                <Collapse in={shouldBeExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const isChildItemActive = isActive(child.path);
                      return (
                        <ListItem key={child.text} disablePadding>
                          <ListItemButton
                            onClick={() => handleNavigation(child.path)}
                            sx={{
                              pl: 4,
                              py: 1,
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.08)",
                              },
                              color: "white",
                              bgcolor: isChildItemActive
                                ? "rgba(255,255,255,0.12)"
                                : "transparent",
                            }}
                          >
                            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.text}
                              primaryTypographyProps={{
                                fontSize: "0.875rem",
                                fontWeight: isChildItemActive ? 600 : 400,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
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
