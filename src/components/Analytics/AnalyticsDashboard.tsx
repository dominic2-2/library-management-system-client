'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { AuthService } from '@/services/auth.service';
import { AnalyticsResponse } from '@/features/auth/auth.types';
import { useAuth } from '@/providers/AuthProvider';

const AnalyticsDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await AuthService.getAnalytics(token);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  if (!user) {
    return (
      <Alert severity="warning">
        Please login to view analytics data.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <button onClick={fetchAnalytics}>Retry</button>
      }>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available.
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📊 Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Current Session Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔐 Current Session
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  👤 User: {user.name}
                </Typography>
                <Typography variant="body2">
                  📱 Browser: {user.browserName} {user.browserVersion}
                </Typography>
                <Typography variant="body2">
                  💻 OS: {user.os}
                </Typography>
                <Typography variant="body2">
                  🌐 IP: {user.ipAddress}
                </Typography>
                <Typography variant="body2">
                  🌍 Timezone: {user.timezone}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚡ Active Sessions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h3" color="primary">
                  {analytics.ActiveSessionsLast30Minutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active in last 30 minutes
                </Typography>
                <Typography variant="body2">
                  Total Sessions: {analytics.TotalSessions}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Browser Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌐 Browser Distribution
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {Object.entries(analytics.BrowserDistribution).map(([browser, count]) => (
                  <Box key={browser} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{browser}</Typography>
                    <Chip label={count} size="small" color="primary" />
                  </Box>
                ))}
                {Object.keys(analytics.BrowserDistribution).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* OS Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💻 Operating System Distribution
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {Object.entries(analytics.OperatingSystemDistribution).map(([os, count]) => (
                  <Box key={os} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{os}</Typography>
                    <Chip label={count} size="small" color="secondary" />
                  </Box>
                ))}
                {Object.keys(analytics.OperatingSystemDistribution).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metadata */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ℹ️ Metadata
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date(analytics.GeneratedAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;