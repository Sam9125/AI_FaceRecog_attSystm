/**
 * Shared Face Detection Hook
 * Manages face detection state and logic
 */
import { useState, useRef, useCallback } from 'react';
import { FACE_DETECTION_CONFIG } from '../utils/constants.js';

export const useFaceDetection = () => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceExpression, setFaceExpression] = useState(null);
  const [biometricData, setBiometricData] = useState({
    eyeScan: 0,
    fingerprint: 0,
    faceMesh: 0,
    security: 0,
  });

  const isCapturingRef = useRef(false);
  const startTimeRef = useRef(null);

  /**
   * Start face detection scanning
   */
  const startScanning = useCallback(() => {
    setScanning(true);
    setScanProgress(0);
    setFaceDetected(false);
    setAutoCapture(false);
    isCapturingRef.current = false;
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Stop face detection scanning
   */
  const stopScanning = useCallback(() => {
    setScanning(false);
    setScanProgress(0);
    setFaceDetected(false);
    setAutoCapture(false);
    isCapturingRef.current = false;
    startTimeRef.current = null;
  }, []);

  /**
   * Update scan progress
   * @param {number} elapsed - Elapsed time in seconds
   */
  const updateProgress = useCallback((elapsed) => {
    const progress = Math.min((elapsed / FACE_DETECTION_CONFIG.PROGRESS_DURATION) * 100, 100);
    setScanProgress(progress);

    // Update biometric data progressively
    setBiometricData({
      eyeScan: Math.min(elapsed * 33, 100),
      fingerprint: Math.min((elapsed - 0.5) * 33, 100),
      faceMesh: Math.min(elapsed * 33, 100),
      security: Math.min((elapsed - 1.5) * 33, 100),
    });

    return progress;
  }, []);

  /**
   * Handle face detected
   */
  const onFaceDetected = useCallback(() => {
    setFaceDetected(true);
  }, []);

  /**
   * Handle face lost
   */
  const onFaceLost = useCallback(() => {
    setFaceDetected(false);
    setFaceExpression(null);
  }, []);

  /**
   * Check if should auto-capture
   * @returns {boolean}
   */
  const shouldAutoCapture = useCallback(() => {
    return scanProgress >= 100 && faceDetected && !isCapturingRef.current;
  }, [scanProgress, faceDetected]);

  /**
   * Trigger auto-capture
   */
  const triggerAutoCapture = useCallback(() => {
    isCapturingRef.current = true;
    setAutoCapture(true);
  }, []);

  /**
   * Reset after capture
   */
  const resetAfterCapture = useCallback(() => {
    isCapturingRef.current = false;
    setAutoCapture(false);
    setScanProgress(0);
    setFaceDetected(false);
    setBiometricData({
      eyeScan: 0,
      fingerprint: 0,
      faceMesh: 0,
      security: 0,
    });
  }, []);

  /**
   * Set models loaded status
   */
  const setModelsLoadedStatus = useCallback((loaded) => {
    setModelsLoaded(loaded);
  }, []);

  /**
   * Update face expression
   */
  const updateFaceExpression = useCallback((expression) => {
    setFaceExpression(expression);
  }, []);

  return {
    // State
    faceDetected,
    scanning,
    scanProgress,
    autoCapture,
    modelsLoaded,
    faceExpression,
    biometricData,
    isCapturingRef,
    startTimeRef,

    // Actions
    startScanning,
    stopScanning,
    updateProgress,
    onFaceDetected,
    onFaceLost,
    shouldAutoCapture,
    triggerAutoCapture,
    resetAfterCapture,
    setModelsLoadedStatus,
    updateFaceExpression,
  };
};

export default useFaceDetection;
