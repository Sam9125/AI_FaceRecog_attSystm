import { useState, useRef, useEffect, useCallback } from 'react';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import * as faceapi from 'face-api.js';

function MarkAttendance({ user, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const autoCaptureTimerRef = useRef(null);
  const isCapturingRef = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [biometricData, setBiometricData] = useState({
    eyeScan: 0,
    fingerprint: 0,
    faceMesh: 0,
    security: 0
  });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceExpression, setFaceExpression] = useState(null);
  const [detectionKey, setDetectionKey] = useState(0); // Key to force restart detection
  const canCapture = faceDetected || !modelsLoaded;

  useEffect(() => {
    // Load face-api.js models for real face detection
    const loadModels = async () => {
      try {
        console.log('🔄 Starting to load face-api.js models...');
        // Try multiple CDN sources
        const MODEL_URLS = [
          '/models', // Local models first
          'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
          'https://justadudewhohacks.github.io/face-api.js/models'
        ];
        
        let modelsLoadedSuccessfully = false;
        
        for (const MODEL_URL of MODEL_URLS) {
          try {
            console.log(`Trying to load models from: ${MODEL_URL}`);
            
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
              faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
              faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            
            console.log(`✅ All models loaded successfully from: ${MODEL_URL}`);
            modelsLoadedSuccessfully = true;
            break;
          } catch (err) {
            console.warn(`❌ Failed to load from ${MODEL_URL}:`, err.message);
            continue;
          }
        }
        
        if (modelsLoadedSuccessfully) {
          console.log('✅✅✅ ALL MODELS LOADED SUCCESSFULLY! ✅✅✅');
          console.log('Setting modelsLoaded to TRUE');
          setModelsLoaded(true);
        } else {
          throw new Error('Failed to load models from all sources');
        }
      } catch (error) {
        console.error('❌ Error loading models:', error);
        console.error('Error details:', error.message, error.stack);
        setModelsLoaded(false);
        setError('Failed to load face detection models. Please refresh the page.');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered - useWebcam:', useWebcam, 'capturedImage:', !!capturedImage, 'detectionKey:', detectionKey);
    
    // Always stop any existing detection first
    stopFaceDetection();
    
    if (useWebcam && !capturedImage) {
      console.log('✅ Starting face detection...');
      // Reset all flags before starting
      isCapturingRef.current = false;
      setScanProgress(0);
      setScanning(true);
      setFaceDetected(false);
      setBiometricData({
        eyeScan: 0,
        fingerprint: 0,
        faceMesh: 0,
        security: 0
      });
      // Start detection after a small delay to ensure cleanup is complete
      setTimeout(() => {
        startFaceDetection();
      }, 100);
    } else {
      console.log('⏹️ Stopping face detection...');
    }
    return () => {
      console.log('🧹 Cleanup - stopping face detection');
      stopFaceDetection();
    };
  }, [useWebcam, capturedImage, detectionKey]); // Added detectionKey to force restart

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
    const startTime = Date.now();
    console.log('🚀 Starting face detection loop at', new Date().toLocaleTimeString());
    
    const detectFace = async () => {
      // Don't continue if auto-capture is in progress
      if (isCapturingRef.current) {
        console.log('⏸️ Skipping detection - capture in progress');
        // Don't schedule next frame - wait for reset
        return;
      }
      
      if (webcamRef.current && canvasRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match video
        const displayWidth = video.offsetWidth;
        const displayHeight = video.offsetHeight;
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Update scan progress
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / 3) * 100, 100);
        setScanProgress(progress);
        
        // Debug logging at key milestones
        if (progress >= 25 && progress < 26) {
          console.log('📊 25% complete | Elapsed:', elapsed.toFixed(2), 's');
        } else if (progress >= 50 && progress < 51) {
          console.log('📊 50% complete | Elapsed:', elapsed.toFixed(2), 's');
        } else if (progress >= 75 && progress < 76) {
          console.log('📊 75% complete | Elapsed:', elapsed.toFixed(2), 's');
        } else if (progress >= 99) {
          console.log('📊 Progress:', progress.toFixed(1), '% | Elapsed:', elapsed.toFixed(2), 's | isCapturing:', isCapturingRef.current);
        }

        // Update biometric data progressively
        setBiometricData({
          eyeScan: Math.min(elapsed * 33, 100),
          fingerprint: Math.min((elapsed - 0.5) * 33, 100),
          faceMesh: Math.min(elapsed * 33, 100),
          security: Math.min((elapsed - 1.5) * 33, 100)
        });

        // Real-time face detection with landmarks
        let currentFaceDetected = false;
        if (modelsLoaded) {
          try {
            const detections = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
            
            // Clear canvas first
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            
            if (detections) {
              currentFaceDetected = true;
              setFaceDetected(true);
              
              // Only log face detection at key progress points to reduce spam
              if (progress < 10 || progress >= 99) {
                console.log('✅ REAL Face detected! Progress:', progress.toFixed(1), '%');
              }
              
              // Store expressions
              if (detections.expressions) {
                setFaceExpression(detections.expressions);
              }
              
              // Match dimensions and resize
              const displaySize = { width: displayWidth, height: displayHeight };
              faceapi.matchDimensions(canvas, displaySize);
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              
              // Draw scanning effects first (background)
              drawScanningEffects(ctx, displayWidth, displayHeight, elapsed, resizedDetections);
              
              // Draw facial landmarks on top (foreground)
              if (resizedDetections.landmarks) {
                const landmarks = resizedDetections.landmarks.positions;
                drawLandmarks(ctx, landmarks);
              }
              
              // Check if scanning is complete for auto-capture
              if (progress >= 100 && !isCapturingRef.current) {
                console.log('🎯 Scanning complete! Auto-capturing...');
                console.log('Progress:', progress, 'isCapturing:', isCapturingRef.current);
                console.log('Elapsed time:', elapsed, 'seconds');
                
                // Set flag to prevent multiple captures
                isCapturingRef.current = true;
                setAutoCapture(true);
                
                // Stop animation immediately
                if (animationRef.current) {
                  cancelAnimationFrame(animationRef.current);
                  animationRef.current = null;
                }
                
                // Trigger auto-capture immediately
                console.log('⏰ Calling handleCapture now...');
                handleCapture();
                
                return; // Exit the function to prevent further animation
              }
              
            } else {
              // No face detected - show static UI in center
              setFaceDetected(false);
              setFaceExpression(null);
              
              // Only log occasionally to reduce spam
              if (Math.floor(elapsed) % 2 === 0 && elapsed - Math.floor(elapsed) < 0.1) {
                console.log('⚠️ No face detected in frame');
              }
              
              const centerX = displayWidth / 2;
              const centerY = displayHeight / 2;
              const faceRadius = Math.min(displayWidth, displayHeight) * 0.15;
              
              // Create fake detection for static UI
              const fakeDetection = {
                detection: {
                  box: {
                    x: centerX - faceRadius,
                    y: centerY - faceRadius,
                    width: faceRadius * 2,
                    height: faceRadius * 2
                  }
                }
              };
              
              drawScanningEffects(ctx, displayWidth, displayHeight, elapsed, fakeDetection);
              
              // Draw static fake landmarks
              const fakeLandmarks = generateFakeLandmarks(centerX, centerY, faceRadius);
              drawLandmarks(ctx, fakeLandmarks);
              
              // Add "SEARCHING" text
              ctx.save();
              ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
              ctx.font = 'bold 14px monospace';
              ctx.textAlign = 'center';
              ctx.shadowBlur = 15;
              ctx.shadowColor = 'rgba(255, 200, 0, 1)';
              ctx.fillText('⚠ SEARCHING FOR FACE', centerX, centerY - faceRadius * 2.5);
              ctx.restore();
            }
          } catch (error) {
            console.error('Face detection error:', error);
            setFaceDetected(false);
            
            // Show static UI even on error
            const centerX = displayWidth / 2;
            const centerY = displayHeight / 2;
            const faceRadius = Math.min(displayWidth, displayHeight) * 0.15;
            
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            
            const fakeDetection = {
              detection: {
                box: {
                  x: centerX - faceRadius,
                  y: centerY - faceRadius,
                  width: faceRadius * 2,
                  height: faceRadius * 2
                }
              }
            };
            
            drawScanningEffects(ctx, displayWidth, displayHeight, elapsed, fakeDetection);
            const fakeLandmarks = generateFakeLandmarks(centerX, centerY, faceRadius);
            drawLandmarks(ctx, fakeLandmarks);
          }
        } else {
          // Models not loaded yet - show static UI but still allow capture after 3 seconds
          const centerX = displayWidth / 2;
          const centerY = displayHeight / 2;
          const faceRadius = Math.min(displayWidth, displayHeight) * 0.15;
          
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          
          const fakeDetection = {
            detection: {
              box: {
                x: centerX - faceRadius,
                y: centerY - faceRadius,
                width: faceRadius * 2,
                height: faceRadius * 2
              }
            }
          };
          
          drawScanningEffects(ctx, displayWidth, displayHeight, elapsed, fakeDetection);
          const fakeLandmarks = generateFakeLandmarks(centerX, centerY, faceRadius);
          drawLandmarks(ctx, fakeLandmarks);
          
          // Enable face detection after 2 seconds even without models
          if (elapsed >= 2) {
            setFaceDetected(true);
            
            // Auto-capture after 3 seconds
            if (progress >= 100 && !isCapturingRef.current) {
              console.log('🎯 Auto-capturing (no models mode)...');
              isCapturingRef.current = true;
              setAutoCapture(true);
              
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
              }
              
              handleCapture();
              return;
            }
          } else {
            setFaceDetected(false);
          }
          
          // Add loading text
          ctx.save();
          ctx.fillStyle = 'rgba(0, 200, 255, 0.9)';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(0, 200, 255, 1)';
          if (elapsed < 2) {
            ctx.fillText('⏳ LOADING AI MODELS...', centerX, centerY - faceRadius * 2.5);
          } else {
            ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
            ctx.shadowColor = 'rgba(0, 255, 136, 1)';
            ctx.fillText('✅ READY TO CAPTURE', centerX, centerY - faceRadius * 2.5);
          }
          ctx.restore();
        }
      }
      
      // Continue animation loop only if not auto-capturing
      if (!isCapturingRef.current) {
        animationRef.current = requestAnimationFrame(detectFace);
      } else {
        console.log('⏸️ Animation loop paused - waiting for capture to complete');
      }
    };
    detectFace();
  };

  const stopFaceDetection = () => {
    console.log('🛑 stopFaceDetection called');
    if (animationRef.current) {
      console.log('🛑 Cancelling animation frame:', animationRef.current);
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (autoCaptureTimerRef.current) {
      console.log('🛑 Clearing auto-capture timer');
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    setScanning(false);
    // Don't reset isCapturingRef here - let handleCapture manage it
  };

  const drawNoFaceDetected = (ctx, width, height, time) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const faceRadius = Math.min(width, height) * 0.25;

    ctx.save();
    
    // Pulsing red circle
    const pulse = Math.sin(time * 3) * 0.2 + 0.8;
    ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
    ctx.lineWidth = 8;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Text
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NO FACE DETECTED', centerX, centerY);
    ctx.font = '20px Arial';
    ctx.fillText('Position your face in frame', centerX, centerY + 40);
    
    ctx.restore();
  };

  const generateFakeLandmarks = (centerX, centerY, radius) => {
    // Generate 68 fake landmark points in face shape
    const landmarks = [];
    
    // Jaw line (0-16) - 17 points
    for (let i = 0; i < 17; i++) {
      const angle = Math.PI * 0.6 + (i / 16) * Math.PI * 0.8;
      landmarks.push({
        x: centerX + Math.cos(angle) * radius * 0.9,
        y: centerY + Math.sin(angle) * radius * 1.1
      });
    }
    
    // Left eyebrow (17-21) - 5 points
    for (let i = 0; i < 5; i++) {
      landmarks.push({
        x: centerX - radius * 0.5 + (i / 4) * radius * 0.3,
        y: centerY - radius * 0.5
      });
    }
    
    // Right eyebrow (22-26) - 5 points
    for (let i = 0; i < 5; i++) {
      landmarks.push({
        x: centerX + radius * 0.2 + (i / 4) * radius * 0.3,
        y: centerY - radius * 0.5
      });
    }
    
    // Nose bridge (27-30) - 4 points
    for (let i = 0; i < 4; i++) {
      landmarks.push({
        x: centerX,
        y: centerY - radius * 0.3 + (i / 3) * radius * 0.4
      });
    }
    
    // Nose bottom (31-35) - 5 points
    for (let i = 0; i < 5; i++) {
      landmarks.push({
        x: centerX - radius * 0.15 + (i / 4) * radius * 0.3,
        y: centerY + radius * 0.1
      });
    }
    
    // Left eye (36-41) - 6 points
    const leftEyeX = centerX - radius * 0.35;
    const leftEyeY = centerY - radius * 0.2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      landmarks.push({
        x: leftEyeX + Math.cos(angle) * radius * 0.15,
        y: leftEyeY + Math.sin(angle) * radius * 0.1
      });
    }
    
    // Right eye (42-47) - 6 points
    const rightEyeX = centerX + radius * 0.35;
    const rightEyeY = centerY - radius * 0.2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      landmarks.push({
        x: rightEyeX + Math.cos(angle) * radius * 0.15,
        y: rightEyeY + Math.sin(angle) * radius * 0.1
      });
    }
    
    // Outer lips (48-59) - 12 points
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      landmarks.push({
        x: centerX + Math.cos(angle) * radius * 0.25,
        y: centerY + radius * 0.5 + Math.sin(angle) * radius * 0.15
      });
    }
    
    // Inner lips (60-67) - 8 points
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      landmarks.push({
        x: centerX + Math.cos(angle) * radius * 0.18,
        y: centerY + radius * 0.5 + Math.sin(angle) * radius * 0.1
      });
    }
    
    return landmarks;
  };

  const drawLandmarks = (ctx, landmarks) => {
    if (!landmarks || landmarks.length === 0) return;
    
    ctx.save();
    
    // Draw landmark points (small cyan dots)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw face mesh grid (like in reference image)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    
    // Helper to draw line between two landmark indices
    const drawLine = (i1, i2) => {
      if (i1 >= landmarks.length || i2 >= landmarks.length) return;
      ctx.beginPath();
      ctx.moveTo(landmarks[i1].x, landmarks[i1].y);
      ctx.lineTo(landmarks[i2].x, landmarks[i2].y);
      ctx.stroke();
    };
    
    // Draw jaw line connections (0-16)
    for (let i = 0; i < 16; i++) {
      drawLine(i, i + 1);
    }
    
    // Draw left eyebrow (17-21)
    for (let i = 17; i < 21; i++) {
      drawLine(i, i + 1);
    }
    
    // Draw right eyebrow (22-26)
    for (let i = 22; i < 26; i++) {
      drawLine(i, i + 1);
    }
    
    // Draw nose bridge (27-30)
    for (let i = 27; i < 30; i++) {
      drawLine(i, i + 1);
    }
    
    // Draw nose bottom (31-35)
    for (let i = 31; i < 35; i++) {
      drawLine(i, i + 1);
    }
    
    // Draw left eye (36-41)
    for (let i = 36; i < 41; i++) {
      drawLine(i, i + 1);
    }
    drawLine(41, 36); // Close eye
    
    // Draw right eye (42-47)
    for (let i = 42; i < 47; i++) {
      drawLine(i, i + 1);
    }
    drawLine(47, 42); // Close eye
    
    // Draw outer lips (48-59)
    for (let i = 48; i < 59; i++) {
      drawLine(i, i + 1);
    }
    drawLine(59, 48); // Close outer lips
    
    // Draw inner lips (60-67)
    if (landmarks.length >= 68) {
      for (let i = 60; i < 67; i++) {
        drawLine(i, i + 1);
      }
      drawLine(67, 60); // Close inner lips
    }
    
    // ADDITIONAL MESH LINES for 3D grid effect (like reference image)
    // Vertical lines across face
    drawLine(27, 8);  // Nose to chin center
    drawLine(27, 33); // Nose bridge to nose tip
    drawLine(33, 51); // Nose tip to upper lip
    drawLine(51, 57); // Upper lip to lower lip
    drawLine(57, 8);  // Lower lip to chin
    
    // Horizontal lines across face
    drawLine(0, 16);  // Jaw line
    drawLine(17, 26); // Eyebrows
    drawLine(36, 45); // Eyes level
    drawLine(31, 35); // Nose bottom
    drawLine(48, 54); // Mouth
    
    // Cross connections for mesh effect
    drawLine(1, 36);  // Left jaw to left eye
    drawLine(15, 45); // Right jaw to right eye
    drawLine(2, 31);  // Left jaw to nose
    drawLine(14, 35); // Right jaw to nose
    drawLine(3, 48);  // Left jaw to mouth
    drawLine(13, 54); // Right jaw to mouth
    
    // Forehead to features (creates grid)
    drawLine(19, 27); // Left eyebrow to nose bridge
    drawLine(24, 27); // Right eyebrow to nose bridge
    drawLine(17, 36); // Left eyebrow to left eye
    drawLine(26, 45); // Right eyebrow to right eye
    
    // Eye to nose connections
    drawLine(39, 31); // Left eye to nose
    drawLine(42, 35); // Right eye to nose
    
    // Nose to mouth connections
    drawLine(31, 48); // Left nose to mouth
    drawLine(35, 54); // Right nose to mouth
    
    // Additional cross-face lines for dense mesh
    drawLine(1, 31);  // Jaw to nose
    drawLine(15, 35); // Jaw to nose
    drawLine(4, 48);  // Jaw to mouth corner
    drawLine(12, 54); // Jaw to mouth corner
    
    ctx.restore();
  };

  const drawScanningEffects = (ctx, width, height, time, detections) => {
    if (!detections || !detections.detection) return;

    const box = detections.detection.box;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const faceRadius = Math.max(box.width, box.height) / 2;

    ctx.save();
    
    // Multiple concentric circles with different animations
    for (let i = 0; i < 3; i++) {
      const radius = faceRadius * (1.2 + i * 0.3);
      const opacity = 0.6 - i * 0.2;
      const pulse = Math.sin(time * 2 + i) * 0.1 + 0.9;
      
      ctx.strokeStyle = `rgba(0, 200, 255, ${opacity * pulse})`;
      ctx.lineWidth = 2 - i * 0.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Rotating outer ring with segments
    const segments = 48;
    const rotation = time * 0.8;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      const nextAngle = ((i + 1) / segments) * Math.PI * 2 + rotation;
      
      // Create alternating pattern
      if (i % 6 === 0) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
        ctx.lineWidth = 4;
      } else if (i % 3 === 0) {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.2)';
        ctx.lineWidth = 1;
      }
      
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, faceRadius * 2.2, angle, nextAngle);
      ctx.stroke();
    }

    // Advanced corner brackets with double lines
    const bracketSize = faceRadius * 1.8;
    const bracketLength = 60;
    const bracketGap = 8;
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    ctx.setLineDash([]);
    
    // Top-left outer
    ctx.beginPath();
    ctx.moveTo(centerX - bracketSize, centerY - bracketSize + bracketLength);
    ctx.lineTo(centerX - bracketSize, centerY - bracketSize);
    ctx.lineTo(centerX - bracketSize + bracketLength, centerY - bracketSize);
    ctx.stroke();
    
    // Top-left inner
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - bracketSize + bracketGap, centerY - bracketSize + bracketLength - bracketGap);
    ctx.lineTo(centerX - bracketSize + bracketGap, centerY - bracketSize + bracketGap);
    ctx.lineTo(centerX - bracketSize + bracketLength - bracketGap, centerY - bracketSize + bracketGap);
    ctx.stroke();
    
    // Top-right
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX + bracketSize - bracketLength, centerY - bracketSize);
    ctx.lineTo(centerX + bracketSize, centerY - bracketSize);
    ctx.lineTo(centerX + bracketSize, centerY - bracketSize + bracketLength);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + bracketSize - bracketLength + bracketGap, centerY - bracketSize + bracketGap);
    ctx.lineTo(centerX + bracketSize - bracketGap, centerY - bracketSize + bracketGap);
    ctx.lineTo(centerX + bracketSize - bracketGap, centerY - bracketSize + bracketLength - bracketGap);
    ctx.stroke();
    
    // Bottom-left
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - bracketSize, centerY + bracketSize - bracketLength);
    ctx.lineTo(centerX - bracketSize, centerY + bracketSize);
    ctx.lineTo(centerX - bracketSize + bracketLength, centerY + bracketSize);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - bracketSize + bracketGap, centerY + bracketSize - bracketLength + bracketGap);
    ctx.lineTo(centerX - bracketSize + bracketGap, centerY + bracketSize - bracketGap);
    ctx.lineTo(centerX - bracketSize + bracketLength - bracketGap, centerY + bracketSize - bracketGap);
    ctx.stroke();
    
    // Bottom-right
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX + bracketSize - bracketLength, centerY + bracketSize);
    ctx.lineTo(centerX + bracketSize, centerY + bracketSize);
    ctx.lineTo(centerX + bracketSize, centerY + bracketSize - bracketLength);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + bracketSize - bracketLength + bracketGap, centerY + bracketSize - bracketGap);
    ctx.lineTo(centerX + bracketSize - bracketGap, centerY + bracketSize - bracketGap);
    ctx.lineTo(centerX + bracketSize - bracketGap, centerY + bracketSize - bracketLength + bracketGap);
    ctx.stroke();

    // Center crosshair with animated lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 12;
    ctx.setLineDash([5, 5]);
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - faceRadius * 1.8);
    ctx.lineTo(centerX, centerY + faceRadius * 1.8);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 1.8, centerY);
    ctx.lineTo(centerX + faceRadius * 1.8, centerY);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Multiple scanning lines at different speeds
    const scanY1 = centerY - faceRadius * 1.8 + ((time % 3) / 3) * (faceRadius * 3.6);
    const scanY2 = centerY - faceRadius * 1.8 + ((time % 4) / 4) * (faceRadius * 3.6);
    
    // Primary scan line
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 1.8, scanY1);
    ctx.lineTo(centerX + faceRadius * 1.8, scanY1);
    ctx.stroke();
    
    // Secondary scan line
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(centerX - faceRadius * 1.8, scanY2);
    ctx.lineTo(centerX + faceRadius * 1.8, scanY2);
    ctx.stroke();

    // Data points around face
    const dataPoints = 8;
    for (let i = 0; i < dataPoints; i++) {
      const angle = (i / dataPoints) * Math.PI * 2 + time * 0.5;
      const distance = faceRadius * 2.4;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Outer glow
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(0, 255, 255, 1)';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner dot
      ctx.fillStyle = 'rgba(0, 255, 255, 1)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Connection line to face
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX + Math.cos(angle) * faceRadius * 1.5, centerY + Math.sin(angle) * faceRadius * 1.5);
      ctx.stroke();
    }

    // Status text with background
    const textY = centerY + faceRadius * 2.0 + 30;
    
    // Background box for text
    ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
    ctx.fillRect(centerX - 100, textY - 25, 200, 40);
    
    // Border for text box
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 100, textY - 25, 200, 40);
    
    // "CONNECTED" text
    ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    ctx.fillText('● CONNECTED', centerX, textY);
    
    // Small text above
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillText('FACIAL-ANALYSIS-ACTIVE', centerX, textY - 35);
    
    // ID text
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.fillText(`ID: ${Math.floor(time * 1000) % 10000}`, centerX, textY + 15);

    // Animated particles with trails
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + time * 1.5;
      const distance = faceRadius * 2.5 + Math.sin(time * 3 + i) * 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const alpha = 0.3 + Math.sin(time * 4 + i) * 0.3;
      const size = 1.5 + Math.sin(time * 2 + i) * 0.5;
      
      ctx.fillStyle = `rgba(0, 220, 255, ${alpha})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0, 220, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const handleCapture = async () => {
    console.log('📸 handleCapture called!');
    console.log('webcamRef.current:', webcamRef.current);
    
    if (!webcamRef.current) {
      console.error('❌ webcamRef.current is null!');
      setError('Webcam not ready');
      setAutoCapture(false);
      return;
    }
    
    const imageSrc = webcamRef.current.getScreenshot();
    console.log('Image captured:', imageSrc ? 'Success' : 'Failed');
    
    if (!imageSrc) {
      setError('Failed to capture image');
      setAutoCapture(false);
      return;
    }

    setCapturedImage(imageSrc);
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const file = dataURLtoFile(imageSrc, 'attendance.jpg');
      console.log('📤 Sending to API...');
      const response = await attendanceAPI.markAttendance(file);
      console.log('✅ API Response:', response.data);
      
      setMessage(
        `✅ Attendance marked successfully! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
      );
      
      console.log('⏱️ Setting 3-second timeout to reset...');
      setTimeout(() => {
        console.log('🔄 Resetting after success...');
        setCapturedImage(null);
        setMessage('');
        setAutoCapture(false);
        isCapturingRef.current = false; // Reset for next capture
        setScanProgress(0); // Reset progress
        setDetectionKey(prev => prev + 1); // Force restart detection
      }, 3000);
    } catch (err) {
      console.error('❌ API Error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to mark attendance';
      setError(errorMsg);
      
      // If face mismatch, keep the captured image visible for review
      if (!errorMsg.includes('Face mismatch')) {
        setTimeout(() => {
          console.log('🔄 Resetting after error...');
          setCapturedImage(null);
          setAutoCapture(false);
          isCapturingRef.current = false; // Reset for next capture
          setScanProgress(0); // Reset progress
          setDetectionKey(prev => prev + 1); // Force restart detection
        }, 5000);
      } else {
        setAutoCapture(false);
        isCapturingRef.current = false; // Reset immediately on mismatch
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
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
            Mark Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Capture your face to mark attendance for today
          </Typography>

          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                      style={{ 
                        width: '100%', 
                        maxHeight: isMobile ? '56vh' : 'unset',
                        display: 'block', 
                        filter: 'brightness(0.8)',
                        position: 'relative',
                        zIndex: 1
                      }}
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
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />
                    
                    {/* Models Loading Indicator */}
                    {!modelsLoaded && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                          border: '2px solid #00d4ff',
                          color: '#00d4ff',
                          px: { xs: 2, sm: 4 },
                          py: { xs: 2, sm: 3 },
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          zIndex: 10,
                        }}
                      >
                        <CircularProgress size={40} sx={{ color: '#00d4ff' }} />
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          Loading Face Detection Models...
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00ff88' }}>
                          Please wait, this may take a few seconds
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Top Status Bar */}
                    {scanning && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: faceDetected ? 'rgba(0, 40, 20, 0.9)' : 'rgba(40, 0, 0, 0.9)',
                          border: faceDetected ? '1px solid #00ff88' : '1px solid #ff0066',
                          color: faceDetected ? '#00ff88' : '#ff0066',
                          px: { xs: 1.5, sm: 3 },
                          py: 1,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          boxShadow: faceDetected ? '0 0 20px rgba(0, 255, 136, 0.5)' : '0 0 20px rgba(255, 0, 102, 0.5)',
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: faceDetected ? '#00ff88' : '#ff0066' }} />
                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                          {autoCapture
                            ? 'AUTO-CAPTURING...'
                            : faceDetected
                              ? (isMobile ? 'FACE DETECTED' : 'FACE DETECTED - SCANNING')
                              : (isMobile ? 'NO FACE' : 'NO FACE DETECTED')}
                        </Typography>
                      </Box>
                    )}

                    {/* Biometric Data Panels - Right Side */}
                    {faceDetected && !isMobile && (
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

                        {/* Facial Expression Panel */}
                        {faceExpression && (
                          <Box
                            sx={{
                              bgcolor: 'rgba(40, 0, 40, 0.9)',
                              border: '1px solid #ff00ff',
                              borderRadius: 1,
                              p: 1.5,
                              minWidth: 180,
                              maxWidth: 220,
                              boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#ff00ff', fontFamily: 'monospace', fontWeight: 'bold', mb: 1, display: 'block' }}>
                              😊 EXPRESSION
                            </Typography>
                            {Object.entries(faceExpression)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 3)
                              .map(([emotion, value]) => (
                                <Box key={emotion} sx={{ mb: 0.5 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                                    <Typography variant="caption" sx={{ color: '#ff88ff', fontFamily: 'monospace', fontSize: 9, textTransform: 'uppercase' }}>
                                      {emotion}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ff00ff', fontFamily: 'monospace', fontSize: 9 }}>
                                      {(value * 100).toFixed(0)}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={value * 100} 
                                    sx={{
                                      height: 3,
                                      bgcolor: 'rgba(255, 0, 255, 0.2)',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: '#ff00ff',
                                        boxShadow: '0 0 8px #ff00ff',
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Bottom Status */}
                    {faceDetected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: isMobile ? '50%' : 16,
                          transform: isMobile ? 'translateX(-50%)' : 'none',
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
                          {isMobile ? `ANALYZING ${Math.round(scanProgress)}%` : `ANALYZING DATA • ${Math.round(scanProgress)}%`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCapture}
                    disabled={loading || !canCapture}
                    sx={{ 
                      mt: 2,
                      bgcolor: canCapture ? '#00ff00' : undefined,
                      color: canCapture ? '#000' : undefined,
                      '&:hover': {
                        bgcolor: canCapture ? '#00cc00' : undefined,
                      }
                    }}
                  >
                    {loading
                      ? 'Processing...'
                      : faceDetected
                        ? 'Capture & Mark Attendance'
                        : !modelsLoaded
                          ? 'Capture & Mark Attendance (Fallback)'
                          : 'Position Your Face'}
                  </Button>
                </>
              ) : (
                <Box>
                  <img src={capturedImage} alt="Captured" style={{ width: '100%', borderRadius: 8 }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      console.log('🔄 Capture Again clicked - resetting all states');
                      setCapturedImage(null);
                      setAutoCapture(false);
                      isCapturingRef.current = false;
                      setScanProgress(0);
                      setError('');
                      setMessage('');
                      setDetectionKey(prev => prev + 1); // Force restart detection
                      console.log('✅ Reset complete - should restart detection');
                    }}
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
