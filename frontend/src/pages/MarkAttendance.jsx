import { useState, useRef, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, CircularProgress, LinearProgress } from '@mui/material';
import Webcam from 'react-webcam';
import Navbar from '../components/Navbar';
import { attendanceAPI } from '../services/api';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';

function MarkAttendance({ user, onLogout }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [biometricData, setBiometricData] = useState({
    eyeScan: 0,
    fingerprint: 0,
    faceMesh: 0,
    security: 0
  });

  useEffect(() => {
    if (useWebcam && !capturedImage) {
      setScanning(true);
      startFaceDetection();
    } else {
      stopFaceDetection();
    }
    return () => stopFaceDetection();
  }, [useWebcam, capturedImage]);

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const startFaceDetection = () => {
    let startTime = Date.now();
    const detectFace = () => {
      if (webcamRef.current && canvasRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Update scan progress
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / 3) * 100, 100);
        setScanProgress(progress);

        // Update biometric data progressively
        setBiometricData({
          eyeScan: Math.min(elapsed * 33, 100),
          fingerprint: Math.min((elapsed - 0.5) * 33, 100),
          faceMesh: Math.min((elapsed - 1) * 33, 100),
          security: Math.min((elapsed - 1.5) * 33, 100)
        });

        // Draw advanced face scanning UI
        drawAdvancedFaceScan(ctx, canvas.width, canvas.height, elapsed);
      }
      animationRef.current = requestAnimationFrame(detectFace);
    };
    detectFace();
  };

  const stopFaceDetection = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setScanning(false);
    }
  };

  const drawAdvancedFaceScan = (ctx, width, height, time) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const faceRadius = Math.min(width, height) * 0.25;

    // Draw outer rotating circles
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Outer circle with segments
    const segments = 32;
    const rotation = time * 0.5;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      const nextAngle = ((i + 1) / segments) * Math.PI * 2 + rotation;
      
      if (i % 4 === 0) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 2;
      }
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00d4ff';
      
      ctx.beginPath();
      ctx.arc(0, 0, faceRadius * 1.5, angle, nextAngle);
      ctx.stroke();
    }

    // Middle rotating ring
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, faceRadius * 1.3, -rotation * 1.5, Math.PI * 2 - rotation * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner circle
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, faceRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Corner brackets
    const bracketSize = faceRadius * 1.6;
    const bracketLength = 40;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ff88';
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-bracketSize, -bracketSize + bracketLength);
    ctx.lineTo(-bracketSize, -bracketSize);
    ctx.lineTo(-bracketSize + bracketLength, -bracketSize);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(bracketSize - bracketLength, -bracketSize);
    ctx.lineTo(bracketSize, -bracketSize);
    ctx.lineTo(bracketSize, -bracketSize + bracketLength);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(-bracketSize, bracketSize - bracketLength);
    ctx.lineTo(-bracketSize, bracketSize);
    ctx.lineTo(-bracketSize + bracketLength, bracketSize);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(bracketSize - bracketLength, bracketSize);
    ctx.lineTo(bracketSize, bracketSize);
    ctx.lineTo(bracketSize, bracketSize - bracketLength);
    ctx.stroke();

    // Face mesh points
    const meshPoints = [
      // Face outline
      [0, -faceRadius * 0.9],
      [-faceRadius * 0.7, -faceRadius * 0.5],
      [faceRadius * 0.7, -faceRadius * 0.5],
      [-faceRadius * 0.85, 0],
      [faceRadius * 0.85, 0],
      [-faceRadius * 0.6, faceRadius * 0.5],
      [faceRadius * 0.6, faceRadius * 0.5],
      [0, faceRadius * 0.9],
      // Eyes
      [-faceRadius * 0.35, -faceRadius * 0.2],
      [faceRadius * 0.35, -faceRadius * 0.2],
      // Nose
      [0, 0],
      [0, faceRadius * 0.2],
      // Mouth
      [-faceRadius * 0.25, faceRadius * 0.5],
      [faceRadius * 0.25, faceRadius * 0.5],
    ];

    // Draw mesh connections
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    
    meshPoints.forEach((point, i) => {
      if (i < meshPoints.length - 1) {
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(meshPoints[i + 1][0], meshPoints[i + 1][1]);
        ctx.stroke();
      }
    });

    // Draw mesh points
    ctx.fillStyle = '#00ff88';
    ctx.shadowBlur = 10;
    meshPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Horizontal scanning line
    const scanY = -faceRadius + ((time % 2) / 2) * (faceRadius * 2);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00d4ff';
    ctx.beginPath();
    ctx.moveTo(-faceRadius, scanY);
    ctx.lineTo(faceRadius, scanY);
    ctx.stroke();

    // Crosshair on eyes
    const drawCrosshair = (x, y, size) => {
      ctx.strokeStyle = '#ff0066';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff0066';
      
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    };
    
    drawCrosshair(-faceRadius * 0.35, -faceRadius * 0.2, 15);
    drawCrosshair(faceRadius * 0.35, -faceRadius * 0.2, 15);

    ctx.restore();

    // Particle effects
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time;
      const distance = faceRadius * 1.8 + Math.sin(time * 2 + i) * 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = `rgba(0, 212, 255, ${0.3 + Math.sin(time * 3 + i) * 0.3})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00d4ff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    setFaceDetected(true);
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image');
      return;
    }

    setCapturedImage(imageSrc);
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const file = dataURLtoFile(imageSrc, 'attendance.jpg');
      const response = await attendanceAPI.markAttendance(file);
      
      setMessage(
        `Attendance marked successfully! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
      );
      setTimeout(() => {
        setCapturedImage(null);
        setMessage('');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to mark attendance';
      setError(errorMsg);
      
      // If face mismatch, keep the captured image visible for review
      if (!errorMsg.includes('Face mismatch')) {
        setTimeout(() => {
          setCapturedImage(null);
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await attendanceAPI.markAttendance(file);
      setMessage(
        `Attendance marked successfully! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
      );
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Mark Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Capture your face to mark attendance for today
          </Typography>

          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant={useWebcam ? 'contained' : 'outlined'}
              startIcon={<CameraAltIcon />}
              onClick={() => setUseWebcam(true)}
              fullWidth
            >
              Use Webcam
            </Button>
            <Button
              variant={!useWebcam ? 'contained' : 'outlined'}
              startIcon={<CloudUploadIcon />}
              component="label"
              fullWidth
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          {useWebcam && (
            <Box sx={{ mt: 3 }}>
              {!capturedImage ? (
                <>
                  <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      style={{ width: '100%', display: 'block', filter: 'brightness(0.8)' }}
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: 'user',
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                    
                    {/* Top Status Bar */}
                    {scanning && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0, 20, 40, 0.9)',
                          border: '1px solid #00d4ff',
                          color: '#00d4ff',
                          px: 3,
                          py: 1,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: '#00d4ff' }} />
                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                          {faceDetected ? 'BIOMETRIC SCAN ACTIVE' : 'INITIALIZING SCANNER...'}
                        </Typography>
                      </Box>
                    )}

                    {/* Biometric Data Panels - Right Side */}
                    {faceDetected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 80,
                          right: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {/* Eye Scan Panel */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(0, 20, 40, 0.9)',
                            border: '1px solid #00d4ff',
                            borderRadius: 1,
                            p: 1.5,
                            minWidth: 120,
                            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <VisibilityIcon sx={{ fontSize: 16, color: '#00d4ff' }} />
                            <Typography variant="caption" sx={{ color: '#00d4ff', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              EYE SCAN
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={biometricData.eyeScan} 
                            sx={{
                              height: 4,
                              bgcolor: 'rgba(0, 212, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#00d4ff',
                                boxShadow: '0 0 10px #00d4ff',
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 10 }}>
                            {Math.round(biometricData.eyeScan)}%
                          </Typography>
                        </Box>

                        {/* Fingerprint Panel */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(0, 20, 40, 0.9)',
                            border: '1px solid #00d4ff',
                            borderRadius: 1,
                            p: 1.5,
                            minWidth: 120,
                            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <FingerprintIcon sx={{ fontSize: 16, color: '#00d4ff' }} />
                            <Typography variant="caption" sx={{ color: '#00d4ff', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              BIOMETRIC
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={biometricData.fingerprint} 
                            sx={{
                              height: 4,
                              bgcolor: 'rgba(0, 212, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#00d4ff',
                                boxShadow: '0 0 10px #00d4ff',
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 10 }}>
                            {Math.round(biometricData.fingerprint)}%
                          </Typography>
                        </Box>

                        {/* Face Mesh Panel */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(0, 20, 40, 0.9)',
                            border: '1px solid #00d4ff',
                            borderRadius: 1,
                            p: 1.5,
                            minWidth: 120,
                            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 16, height: 16, border: '2px solid #00d4ff', borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ color: '#00d4ff', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              FACE MESH
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={biometricData.faceMesh} 
                            sx={{
                              height: 4,
                              bgcolor: 'rgba(0, 212, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#00d4ff',
                                boxShadow: '0 0 10px #00d4ff',
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 10 }}>
                            {Math.round(biometricData.faceMesh)}%
                          </Typography>
                        </Box>

                        {/* Security Panel */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(0, 20, 40, 0.9)',
                            border: '1px solid #00ff88',
                            borderRadius: 1,
                            p: 1.5,
                            minWidth: 120,
                            boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <LockIcon sx={{ fontSize: 16, color: '#00ff88' }} />
                            <Typography variant="caption" sx={{ color: '#00ff88', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              SECURITY
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={biometricData.security} 
                              size={24}
                              sx={{
                                color: '#00ff88',
                                '& .MuiCircularProgress-circle': {
                                  filter: 'drop-shadow(0 0 5px #00ff88)',
                                }
                              }}
                            />
                            <Typography variant="h6" sx={{ color: '#00ff88', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {Math.round(biometricData.security)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Bottom Status */}
                    {faceDetected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          bgcolor: 'rgba(0, 255, 136, 0.2)',
                          color: '#00ff88',
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          border: '1px solid #00ff88',
                          boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                          ANALYZING DATA • {Math.round(scanProgress)}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCapture}
                    disabled={loading || !faceDetected}
                    sx={{ 
                      mt: 2,
                      bgcolor: faceDetected ? '#00ff00' : undefined,
                      color: faceDetected ? '#000' : undefined,
                      '&:hover': {
                        bgcolor: faceDetected ? '#00cc00' : undefined,
                      }
                    }}
                  >
                    {loading ? 'Processing...' : faceDetected ? 'Capture & Mark Attendance' : 'Position Your Face'}
                  </Button>
                </>
              ) : (
                <Box>
                  <img src={capturedImage} alt="Captured" style={{ width: '100%', borderRadius: 8 }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setCapturedImage(null)}
                    sx={{ mt: 2 }}
                  >
                    Capture Again
                  </Button>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" color="primary">
              Important Notes:
            </Typography>
            <ul>
              <li>Attendance can only be marked once per day</li>
              <li>You must use YOUR OWN registered face</li>
              <li>Using someone else's face will be rejected</li>
              <li>Ensure your face is clearly visible</li>
              <li>Good lighting improves recognition accuracy</li>
              <li>Look directly at the camera</li>
            </ul>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default MarkAttendance;
