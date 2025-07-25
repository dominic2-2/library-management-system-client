'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import DataTable from '@/components/table/DataTable';
import { ENV } from '@/config/env';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, ResponsiveContainer
} from 'recharts';

// const STATUS_LABELS: Record<string, string> = {
//   Pending: 'Chờ xử lý',
//   Available: 'Có thể nhận',
//   Collected: 'Đã nhận',
//   Canceled: 'Đã hủy',
//   Expired: 'Hết hạn',
// };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#B71C1C'];

const StaffHomePage = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${ENV.apiUrl}/reservations?all=1`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const statusCount: Record<string, number> = {};
        (data.data || []).forEach((r: any) => {
          statusCount[r.reservationStatus] = (statusCount[r.reservationStatus] || 0) + 1;
        });
        const statArr = Object.entries(statusCount).map(([status, count]) => ({
          status,
          label: status,
          count,
        }));
        setStats(statArr);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1>Trang chủ Nhân viên (Staff)</h1>
      <Box mt={4}>
        <Grid container spacing={4}>
          {/* Hàng chứa hai biểu đồ */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ BarChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ PieChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          {/* Các biểu đồ khác trong các hàng riêng biệt */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ LineChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ AreaChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ RadarChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={stats} outerRadius={100}>
                <PolarGrid />
                <PolarAngleAxis dataKey="label" />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...stats.map(s => s.count), 1)]} />
                <Radar name="Số lượng" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Biểu đồ ComposedChart</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="count" stroke="#ff7300" />
                <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </Grid>
          {/* Bảng dữ liệu ở cuối */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Bảng phân loại đặt sách theo trạng thái</Typography>
            <DataTable
              data={stats}
              columns={[
                { key: 'label', label: 'Trạng thái' },
                { key: 'count', label: 'Số lượng' },
              ]}
              loading={loading}
              rowKey={row => row.status}
            />
          </Grid>
        </Grid>
      </Box>
    </main>
  );
};

export default StaffHomePage;