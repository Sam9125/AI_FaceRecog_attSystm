import { useState, useRef } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, Grid } from '@mui/material';
import Webcam from 'react-webcam';
import Navbar from '../components/Navbar';
import { faceAPI } from '../services/api';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function FaceRegistration({ user, onLogout }) {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImages([...capturedImages, imageSrc]);
      setMessage(`Captured ${capturedImages.length + 1} image(s)`);
    }
  };

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

  const handleWebcamSubmit = async () => {
    if (capturedImages.length === 0) {
      setError('Please capture at least one image');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const files = capturedImages.map((img, idx) =>
        dataURLtoFile(img, `face_${idx}.jpg`)
      );

      let response;
      if (files.length === 1) {
        response = await faceAPI.registerFace(files[0]);
      } else {
        response = await faceAPI.registerMultipleFaces(files);
      }

      setMessage(response.data.message);
      setCapturedImages([]);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register face');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      let response;
      if (files.length === 1) {
        response = await faceAPI.registerFace(files[0]);
      } else {
        response = await faceAPI.registerMultipleFaces(files);
      }

      setMessage(response.data.message);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register face');
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
            Register Your Face
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            For better accuracy, capture 3-5 images from different angles
          </Typography>

          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant={useWebcam ? 'contained' : 'outlined'}
                  startIcon={<CameraAltIcon />}
                  onClick={() => setUseWebcam(true)}
                >
                  Use Webcam
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant={!useWebcam ? 'contained' : 'outlined'}
                  startIcon={<CloudUploadIcon />}
                  component="label"
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>

          {useWebcam && (
            <Box sx={{ mt: 3 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: 'user',
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={capture}
                  disabled={loading}
                  fullWidth
                >
                  Capture Image
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleWebcamSubmit}
                  disabled={loading || capturedImages.length === 0}
                  fullWidth
                >
                  {loading ? 'Registering...' : 'Register Face'}
                </Button>
              </Box>

              {capturedImages.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Captured Images ({capturedImages.length})</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {capturedImages.map((img, idx) => (
                      <Grid item xs={4} key={idx}>
                        <img src={img} alt={`Captured ${idx}`} style={{ width: '100%' }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold">Tips for best results:</Typography>
            <ul>
              <li>Ensure good lighting</li>
              <li>Look directly at the camera</li>
              <li>Remove glasses if possible</li>
              <li>Capture from different angles</li>
              <li>Keep a neutral expression</li>
            </ul>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default FaceRegistration;
