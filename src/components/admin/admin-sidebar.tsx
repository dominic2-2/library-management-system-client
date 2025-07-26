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
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  FileCopy as BookCopyIcon,
  Category as CategoryIcon,
  Style as StyleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  LibraryBooks as EditionIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

interface AdminSidebarProps {
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
  children?: MenuItem[];
}

const adminMenuItems: MenuItem[] = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard/admin",
  },
  {
    text: "Books",
    icon: <MenuBookIcon />,
    path: "/dashboard/admin/book",
  },
  {
    text: "Book Copy",
    icon: <BookCopyIcon />,
    path: "/dashboard/admin/book-copy",
  },
  {

    text: "User Management",
    icon: <PersonIcon />,
    path: "/dashboard/admin/user-management",
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
      {
        text: "Editions",
        icon: <EditionIcon />,
        path: "/dashboard/admin/book-attributes/editions",
      },
      {
        text: "Authors",
        icon: <PersonIcon />,
        path: "/dashboard/admin/book-attributes/authors",
      },
    ],
  },
];

const DRAWER_WIDTH = 280;

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
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

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        bgcolor: "#1e3a8a",
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
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Admin Panel
        </Typography>
        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.2)" }}
            >
              {currentUser.full_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {currentUser.full_name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {currentUser.username}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 1 }}>
        {adminMenuItems.map((item) => (
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
                  minHeight: 48,
                  px: 2.5,
                  bgcolor:
                    isActive(item.path) || hasActiveChild(item)
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight:
                        isActive(item.path) || hasActiveChild(item)
                          ? "bold"
                          : "normal",
                    },
                  }}
                />
                {item.children && (
                  <Box>
                    {expandedItems.has(item.text) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu Items */}
            {item.children && (
              <Collapse
                in={expandedItems.has(item.text)}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavigation(child.path)}
                        sx={{
                          minHeight: 40,
                          pl: 4,
                          bgcolor: isActive(child.path)
                            ? "rgba(255,255,255,0.12)"
                            : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.08)",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 2,
                            justifyContent: "center",
                            color: "inherit",
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={child.text}
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontWeight: isActive(child.path)
                                ? "bold"
                                : "normal",
                              fontSize: "0.875rem",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: "block" },
        zIndex: (theme) => theme.zIndex.appBar + 2,
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
