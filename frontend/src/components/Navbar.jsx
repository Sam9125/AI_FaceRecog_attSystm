import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FaceIcon from '@mui/icons-material/Face';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Attendance System
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          
          {!user.has_face_registered && (
            <Button color="inherit" startIcon={<FaceIcon />} onClick={() => navigate('/register-face')}>
              Register Face
            </Button>
          )}
          
          {user.has_face_registered && (
            <Button color="inherit" startIcon={<CheckCircleIcon />} onClick={() => navigate('/mark-attendance')}>
              Mark Attendance
            </Button>
          )}
          
          <Button color="inherit" startIcon={<HistoryIcon />} onClick={() => navigate('/history')}>
            History
          </Button>
          
          {user.role === 'admin' && (
            <Button color="inherit" startIcon={<AdminPanelSettingsIcon />} onClick={() => navigate('/admin')}>
              Admin
            </Button>
          )}
          
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
