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
  const navButtonSx = isMobile
    ? {
        minWidth: 'auto',
        px: 1,
        fontSize: '0.72rem',
        lineHeight: 1.1,
      }
    : {};

  return (
    <AppBar position="static">
      <Toolbar
        sx={{
          minHeight: { xs: 52, sm: 60 },
          px: { xs: 1, sm: 2 },
          gap: 0.5,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            mr: { xs: 0.5, sm: 2 },
            flexShrink: 0,
            fontSize: { xs: '0.9rem', sm: '1.25rem' },
            maxWidth: { xs: 90, sm: 'none' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isMobile ? 'Attendance' : 'AI Attendance System'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.25, sm: 1 },
            flexGrow: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            alignItems: 'center',
          }}
        >
          <Button
            color="inherit"
            size={isMobile ? 'small' : 'medium'}
            startIcon={isMobile ? null : <DashboardIcon />}
            sx={navButtonSx}
            onClick={() => navigate('/dashboard')}
          >
            {isMobile ? 'Dash' : 'Dashboard'}
          </Button>
          
          {!user.has_face_registered && (
            <Button
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              startIcon={isMobile ? null : <FaceIcon />}
              sx={navButtonSx}
              onClick={() => navigate('/register-face')}
            >
              {isMobile ? 'Face' : 'Register Face'}
            </Button>
          )}
          
          {user.has_face_registered && (
            <Button
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              startIcon={isMobile ? null : <CheckCircleIcon />}
              sx={navButtonSx}
              onClick={() => navigate('/mark-attendance')}
            >
              {isMobile ? 'Mark' : 'Mark Attendance'}
            </Button>
          )}
          
          <Button
            color="inherit"
            size={isMobile ? 'small' : 'medium'}
            startIcon={isMobile ? null : <HistoryIcon />}
            sx={navButtonSx}
            onClick={() => navigate('/history')}
          >
            {isMobile ? 'Hist' : 'History'}
          </Button>
          
          {user.role === 'admin' && (
            <Button
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              startIcon={isMobile ? null : <AdminPanelSettingsIcon />}
              sx={navButtonSx}
              onClick={() => navigate('/admin')}
            >
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
