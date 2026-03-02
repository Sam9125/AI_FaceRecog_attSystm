import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FaceRegistration from './pages/FaceRegistration';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';
import AdminDashboard from './pages/AdminDashboard';
import { authAPI } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontSize: 13,
    h4: {
      fontSize: '1.6rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.3rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h6: {
      fontSize: '1.05rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '0.9rem',
      lineHeight: 1.4,
    },
    body2: {
      fontSize: '0.82rem',
      lineHeight: 1.35,
    },
    button: {
      textTransform: 'none',
      fontSize: '0.82rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: '13px',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            paddingLeft: theme.spacing(1.25),
            paddingRight: theme.spacing(1.25),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            borderRadius: 10,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            borderRadius: 10,
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(1.75),
          '&:last-child': {
            paddingBottom: theme.spacing(1.75),
          },
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5),
            '&:last-child': {
              paddingBottom: theme.spacing(1.5),
            },
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 38,
          paddingLeft: theme.spacing(1.75),
          paddingRight: theme.spacing(1.75),
          [theme.breakpoints.down('sm')]: {
            minHeight: 34,
            paddingLeft: theme.spacing(1.25),
            paddingRight: theme.spacing(1.25),
            fontSize: '0.78rem',
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 38,
          [theme.breakpoints.down('sm')]: {
            minHeight: 34,
          },
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 38,
          fontSize: '0.82rem',
          paddingLeft: theme.spacing(1.25),
          paddingRight: theme.spacing(1.25),
          [theme.breakpoints.down('sm')]: {
            minHeight: 34,
            fontSize: '0.75rem',
            paddingLeft: theme.spacing(0.75),
            paddingRight: theme.spacing(0.75),
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            height: 24,
            fontSize: '0.72rem',
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          [theme.breakpoints.down('sm')]: {
            paddingTop: theme.spacing(0.75),
            paddingBottom: theme.spacing(0.75),
            fontSize: '0.75rem',
          },
        }),
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/register-face"
            element={user ? <FaceRegistration user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/mark-attendance"
            element={user ? <MarkAttendance user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={user ? <AttendanceHistory user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/dashboard" />}
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
