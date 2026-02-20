import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import { attendanceAPI } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await attendanceAPI.getMyStats(30);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats ? [
    { name: 'Present', value: stats.present_days, color: '#4caf50' },
    { name: 'Absent', value: stats.absent_days, color: '#f44336' },
  ] : [];

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>

        {!user.has_face_registered && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
            <Typography variant="h6" color="warning.dark">
              Action Required: Register Your Face
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please register your face to start marking attendance.
            </Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.present_days || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Present
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.absent_days || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Absent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.attendance_percentage || 0}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attendance Overview (Last 30 Days)
              </Typography>
              {stats && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Attendance
              </Typography>
              {stats?.recent_attendance?.map((record, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1">
                    {new Date(record.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: {new Date(record.timestamp).toLocaleTimeString()} | 
                    Confidence: {(record.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Dashboard;
