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
} from '@mui/material';
import Navbar from '../components/Navbar';
import { attendanceAPI } from '../services/api';
import { format } from 'date-fns';

function AttendanceHistory({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(startDate, endDate);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
            My Attendance History
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </TableCell>
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
                    <TableCell colSpan={4} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}

export default AttendanceHistory;
