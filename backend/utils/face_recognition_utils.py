import face_recognition
import cv2
import numpy as np
from typing import List, Tuple, Optional, Dict
import logging
from config import settings

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    """Service for face detection, encoding, and recognition"""
    
    @staticmethod
    def detect_faces(image: np.ndarray) -> List[Tuple]:
        """
        Detect faces in an image
        Returns: List of face locations [(top, right, bottom, left), ...]
        """
        try:
            # Convert BGR to RGB (OpenCV uses BGR, face_recognition uses RGB)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect faces using HOG-based detector (faster) or CNN (more accurate)
            face_locations = face_recognition.face_locations(rgb_image, model="hog")
            
            logger.info(f"Detected {len(face_locations)} face(s)")
            return face_locations
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return []
    
    @staticmethod
    def encode_face(image: np.ndarray, face_location: Optional[Tuple] = None) -> Optional[List[float]]:
        """
        Generate face encoding from image
        Args:
            image: Input image (BGR format)
            face_location: Optional pre-detected face location
        Returns: 128-dimensional face encoding or None
        """
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            if face_location:
                encodings = face_recognition.face_encodings(rgb_image, [face_location])
            else:
                encodings = face_recognition.face_encodings(rgb_image)
            
            if len(encodings) > 0:
                return encodings[0].tolist()
            else:
                logger.warning("No face encoding generated")
                return None
        except Exception as e:
            logger.error(f"Error encoding face: {e}")
            return None
    
    @staticmethod
    def compare_faces(known_encoding: List[float], face_encoding: List[float], 
                     tolerance: float = None) -> Tuple[bool, float]:
        """
        Compare two face encodings
        Args:
            known_encoding: Stored face encoding
            face_encoding: New face encoding to compare
            tolerance: Matching threshold (lower = stricter)
        Returns: (is_match, confidence_score)
        """
        try:
            if tolerance is None:
                tolerance = settings.FACE_RECOGNITION_TOLERANCE
            
            # Convert to numpy arrays
            known = np.array(known_encoding)
            current = np.array(face_encoding)
            
            # Calculate face distance (lower = more similar)
            distance = face_recognition.face_distance([known], current)[0]
            
            # Convert distance to confidence score (0-1, higher = more confident)
            confidence = 1 - distance
            
            # Check if match
            is_match = distance <= tolerance
            
            logger.debug(f"Face comparison - Distance: {distance:.4f}, Confidence: {confidence:.4f}, Match: {is_match}")
            
            return is_match, float(confidence)
        except Exception as e:
            logger.error(f"Error comparing faces: {e}")
            return False, 0.0
    
    @staticmethod
    def detect_and_encode_multiple(image: np.ndarray) -> List[Dict]:
        """
        Detect and encode all faces in an image
        Returns: List of dicts with face_location and encoding
        """
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            face_locations = face_recognition.face_locations(rgb_image, model="hog")
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            results = []
            for location, encoding in zip(face_locations, face_encodings):
                results.append({
                    "location": location,
                    "encoding": encoding.tolist()
                })
            
            logger.info(f"Detected and encoded {len(results)} face(s)")
            return results
        except Exception as e:
            logger.error(f"Error in detect_and_encode_multiple: {e}")
            return []
    
    @staticmethod
    def draw_face_box(image: np.ndarray, face_location: Tuple, 
                     name: str = "Unknown", confidence: float = 0.0,
                     color: Tuple = (0, 255, 0)) -> np.ndarray:
        """
        Draw bounding box and label on face
        Args:
            image: Input image
            face_location: (top, right, bottom, left)
            name: Person's name
            confidence: Recognition confidence
            color: Box color (BGR)
        Returns: Annotated image
        """
        top, right, bottom, left = face_location
        
        # Draw rectangle
        cv2.rectangle(image, (left, top), (right, bottom), color, 2)
        
        # Draw label background
        cv2.rectangle(image, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
        
        # Draw text
        label = f"{name} ({confidence:.2%})"
        cv2.putText(image, label, (left + 6, bottom - 6), 
                   cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
        
        return image

class LivenessDetection:
    """Simple liveness detection using eye blink and head movement"""
    
    def __init__(self):
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        self.blink_counter = 0
        self.previous_eye_count = 0
    
    def detect_eyes(self, face_image: np.ndarray) -> int:
        """Detect number of eyes in face region"""
        try:
            gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            eyes = self.eye_cascade.detectMultiScale(gray, 1.3, 5)
            return len(eyes)
        except Exception as e:
            logger.error(f"Error detecting eyes: {e}")
            return 0
    
    def check_blink(self, face_image: np.ndarray) -> bool:
        """
        Check if person blinked
        Returns True if blink detected
        """
        current_eye_count = self.detect_eyes(face_image)
        
        # Blink detected: eyes disappear then reappear
        if self.previous_eye_count >= 2 and current_eye_count == 0:
            self.blink_counter += 1
        
        self.previous_eye_count = current_eye_count
        
        return self.blink_counter > 0
    
    def reset(self):
        """Reset liveness detection state"""
        self.blink_counter = 0
        self.previous_eye_count = 0
