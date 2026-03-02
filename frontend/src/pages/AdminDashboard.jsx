import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Avatar,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { attendanceAPI, authAPI } from '../services/api';
import { format } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function AdminDashboard({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
    if (tabValue === 1) {
      fetchUsers();
    }
  }, [selectedDate, tabValue]);

  const fetchData = async () => {
    try {
      const [attendanceRes, reportRes] = await Promise.all([
        attendanceAPI.getAttendanceByDate(selectedDate),
        attendanceAPI.getDailyReport(selectedDate),
      ]);
      setAttendance(attendanceRes.data);
      setReport(reportRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const downloadCSV = () => {
    if (!attendance.length) return;

    const headers = ['Name', 'Email', 'Date', 'Time', 'Confidence'];
    const rows = attendance.map((record) => [
      record.user_name,
      record.user_email,
      format(new Date(record.date), 'yyyy-MM-dd'),
      format(new Date(record.timestamp), 'HH:mm:ss'),
      (record.confidence * 100).toFixed(1) + '%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
          Admin Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" allowScrollButtonsMobile>
            <Tab icon={<AssessmentIcon />} label="Attendance Reports" />
            <Tab icon={<PeopleIcon />} label="User Management" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <>
            {report && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4">{report.total_users}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {report.present_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Present Today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="error.main">
                        {report.absent_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Absent Today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4">{report.attendance_percentage}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Attendance Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Paper sx={{ p: { xs: 2, sm: 4 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadCSV}
                  disabled={!attendance.length}
                  fullWidth={false}
                >
                  Download CSV
                </Button>
              </Box>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.user_name}</TableCell>
                        <TableCell>{record.user_email}</TableCell>
                        <TableCell>
                          {format(new Date(record.timestamp), 'hh:mm:ss a')}
                        </TableCell>
                        <TableCell>
                          {(record.confidence * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: 'success.light',
                              color: 'success.dark',
                            }}
                          >
                            Present
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {attendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No attendance records for this date
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        {tabValue === 1 && (
          <Paper sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mb: 3 }}>
              <Typography variant="h5">All Registered Users</Typography>
              <Chip 
                label={`Total: ${users.length}`} 
                color="primary" 
                icon={<PeopleIcon />}
              />
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Face Registered</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {userItem.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography>{userItem.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={userItem.role.toUpperCase()} 
                          color={userItem.role === 'admin' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {userItem.has_face_registered ? (
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Yes" 
                            color="success" 
                            size="small"
                          />
                        ) : (
                          <Chip 
                            icon={<CancelIcon />}
                            label="No" 
                            color="warning" 
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={userItem.is_active ? 'Active' : 'Inactive'} 
                          color={userItem.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(userItem.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </>
  );
}

export default AdminDashboard;
