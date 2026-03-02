import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FaceIcon from '@mui/icons-material/Face';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ mr: 2, flexShrink: 0, fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          {isMobile ? 'Attendance' : 'AI Attendance System'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexGrow: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
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
        </Box>

        {isMobile ? (
          <IconButton color="inherit" onClick={onLogout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        ) : (
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
