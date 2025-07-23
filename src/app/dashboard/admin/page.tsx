"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
} from "@mui/material";
import {
  MenuBook as BookIcon,
  Category as CategoryIcon,
  Style as StyleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const dashboardItems = [
    {
      title: "Books",
      description: "Manage books, volumes, and copies",
      icon: <BookIcon sx={{ fontSize: 40, color: "#1e3a8a" }} />,
      path: "/dashboard/admin/book",
      color: "#1e3a8a",
    },
    {
      title: "Categories",
      description: "Manage book categories",
      icon: <CategoryIcon sx={{ fontSize: 40, color: "#059669" }} />,
      path: "/dashboard/admin/book-attributes/categories",
      color: "#059669",
    },
    {
      title: "Cover Types",
      description: "Manage book cover types",
      icon: <StyleIcon sx={{ fontSize: 40, color: "#dc2626" }} />,
      path: "/dashboard/admin/book-attributes/cover-types",
      color: "#dc2626",
    },
    {
      title: "Paper Qualities",
      description: "Manage paper quality types",
      icon: <DescriptionIcon sx={{ fontSize: 40, color: "#7c3aed" }} />,
      path: "/dashboard/admin/book-attributes/paper-qualities",
      color: "#7c3aed",
    },
    {
      title: "Publishers",
      description: "Manage book publishers",
      icon: <BusinessIcon sx={{ fontSize: 40, color: "#ea580c" }} />,
      path: "/dashboard/admin/book-attributes/publishers",
      color: "#ea580c",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, color: "#1e3a8a" }}
      >
        Admin Dashboard
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Welcome to the Library Management System Admin Panel. Manage books,
        categories, and system settings.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {dashboardItems.map((item) => (
          <Card
            key={item.title}
            sx={{
              width: {
                xs: "100%",
                sm: "calc(50% - 12px)",
                md: "calc(33.333% - 16px)",
              },
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
              <Box sx={{ mb: 2 }}>{item.icon}</Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", mb: 1, color: item.color }}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleNavigate(item.path)}
                sx={{
                  bgcolor: item.color,
                  "&:hover": {
                    bgcolor: item.color,
                    opacity: 0.9,
                  },
                }}
              >
                Manage {item.title}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Quick Stats */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Quick Statistics
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#1e3a8a" }}
            >
              1,234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Books
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#059669" }}
            >
              56
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Categories
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#dc2626" }}
            >
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cover Types
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#7c3aed" }}
            >
              8
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paper Qualities
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
