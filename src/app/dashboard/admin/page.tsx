"use client";

import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  MenuBook as BookIcon,
  Category as CategoryIcon,
  Style as StyleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchDashboardSummary,
  fetchMonthlyLoans,
  DashboardSummary,
  MonthlyLoan,
} from "@/services/dashboard-service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyLoans, setMonthlyLoans] = useState<MonthlyLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardSummary().then(setSummary),
      fetchMonthlyLoans().then(setMonthlyLoans),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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


      {/* THỐNG KÊ */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Thống Kê Nhanh
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                  {summary?.totalLoans ?? "--"}
                </Typography>
                <Typography variant="body2" color="text.secondary">Tổng lượt mượn</Typography>
              </Box>
              <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#dc2626" }}>
                  {summary?.overdueLoans ?? "--"}
                </Typography>
                <Typography variant="body2" color="text.secondary">Mượn quá hạn</Typography>
              </Box>
              <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#059669" }}>
                  {summary?.totalFines.toLocaleString("vi-VN")}₫
                </Typography>
                <Typography variant="body2" color="text.secondary">Tiền phạt</Typography>
              </Box>
              <Box sx={{ textAlign: "center", flex: "1 1 200px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#7c3aed" }}>
                  {summary?.totalReservations ?? "--"}
                </Typography>
                <Typography variant="body2" color="text.secondary">Đặt giữ</Typography>
              </Box>
            </Box>

            {/* 📊 Biểu đồ cột */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Sách Theo Danh Mục
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(summary?.booksByCategory || {})
                    .filter(([key]) => key !== "$id")
                    .map(([label, value]) => ({
                      label,
                      value,
                    })
                    )}
                  margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" interval={0} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* 📈 Biểu đồ dòng */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Lượt Mượn Theo Tháng
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Thống kê số lượt mượn sách trong từng tháng.
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={monthlyLoans}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorLoans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Paper>
      ...

      {/* MENU DASHBOARD */}
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={3}>
          {dashboardItems.map((item) => (
            <Grid key={item.title} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: item.color }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: item.color,
                      "&:hover": {
                        bgcolor: item.color,
                        opacity: 0.9,
                      },
                    }}
                    onClick={() => handleNavigate(item.path)}
                  >
                    Manage {item.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>


    </Box>
  );
}
