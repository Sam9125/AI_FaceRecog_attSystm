from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Optional
from datetime import date, datetime
from database import get_db
from services.attendance_service import AttendanceService
from services.user_service import UserService
from models.attendance import AttendanceCreate, AttendanceResponse, AttendanceStats, DailyAttendanceReport
from utils.face_recognition_utils import FaceRecognitionService
from utils.security import get_current_user_email
from config import settings
import cv2
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

face_service = FaceRecognitionService()

@router.post("/mark", response_model=dict)
async def mark_attendance(
    file: UploadFile = File(...),
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """
    Mark attendance by uploading a face image
    System will recognize the face and mark attendance
    """
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    # Get current user
    current_user = await user_service.get_user_by_email(email)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has registered face
    if not current_user.face_encoding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please register your face first"
        )
    
    # Check if already marked today
    already_marked = await attendance_service.check_attendance_today(str(current_user.id))
    if already_marked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already marked for today"
        )
    
    try:
        # Read uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
        
        # Detect faces
        face_locations = face_service.detect_faces(image)
        
        if len(face_locations) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No face detected in the image"
            )
        
        # Encode detected face
        detected_encoding = face_service.encode_face(image, face_locations[0])
        
        if detected_encoding is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to encode face"
            )
        
        # Compare with stored encoding
        is_match, confidence = face_service.compare_faces(
            current_user.face_encoding,
            detected_encoding
        )
        
        if not is_match or confidence < settings.MIN_CONFIDENCE_THRESHOLD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Face does not match. Confidence: {confidence:.2%}"
            )
        
        # Save attendance image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{current_user.id}_{timestamp}.jpg"
        filepath = os.path.join(settings.ATTENDANCE_IMAGES_DIR, filename)
        
        # Draw face box on image
        annotated_image = face_service.draw_face_box(
            image.copy(),
            face_locations[0],
            current_user.name,
            confidence
        )
        cv2.imwrite(filepath, annotated_image)
        
        # Mark attendance
        attendance = AttendanceCreate(
            user_id=str(current_user.id),
            confidence=confidence,
            image_path=filepath
        )
        
        result = await attendance_service.mark_attendance(attendance)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to mark attendance"
            )
        
        logger.info(f"Attendance marked for user: {email}, confidence: {confidence:.2%}")
        
        return {
            "message": "Attendance marked successfully",
            "user_name": current_user.name,
            "confidence": confidence,
            "timestamp": result.timestamp,
            "image_path": filepath
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking attendance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing attendance: {str(e)}"
        )

@router.post("/mark-multiple", response_model=dict)
async def mark_attendance_multiple_faces(
    file: UploadFile = File(...),
    db=Depends(get_db)
):
    """
    Mark attendance for multiple people in one image
    Admin feature for group attendance
    """
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    try:
        # Read uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
        
        # Detect all faces
        detected_faces = face_service.detect_and_encode_multiple(image)
        
        if len(detected_faces) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No faces detected in the image"
            )
        
        # Get all registered users
        registered_users = await user_service.get_users_with_face_encodings()
        
        marked_users = []
        annotated_image = image.copy()
        
        # Match each detected face
        for detected in detected_faces:
            best_match = None
            best_confidence = 0.0
            
            for user in registered_users:
                is_match, confidence = face_service.compare_faces(
                    user.face_encoding,
                    detected["encoding"]
                )
                
                if is_match and confidence > best_confidence:
                    best_match = user
                    best_confidence = confidence
            
            if best_match and best_confidence >= settings.MIN_CONFIDENCE_THRESHOLD:
                # Check if already marked today
                already_marked = await attendance_service.check_attendance_today(str(best_match.id))
                
                if not already_marked:
                    # Mark attendance
                    attendance = AttendanceCreate(
                        user_id=str(best_match.id),
                        confidence=best_confidence,
                        image_path=None
                    )
                    
                    result = await attendance_service.mark_attendance(attendance)
                    
                    if result:
                        marked_users.append({
                            "user_id": str(best_match.id),
                            "name": best_match.name,
                            "email": best_match.email,
                            "confidence": best_confidence
                        })
                        
                        # Draw green box for marked
                        annotated_image = face_service.draw_face_box(
                            annotated_image,
                            detected["location"],
                            best_match.name,
                            best_confidence,
                            color=(0, 255, 0)
                        )
                else:
                    # Draw yellow box for already marked
                    annotated_image = face_service.draw_face_box(
                        annotated_image,
                        detected["location"],
                        f"{best_match.name} (Already marked)",
                        best_confidence,
                        color=(0, 255, 255)
                    )
            else:
                # Draw red box for unknown
                annotated_image = face_service.draw_face_box(
                    annotated_image,
                    detected["location"],
                    "Unknown",
                    0.0,
                    color=(0, 0, 255)
                )
        
        # Save annotated image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"group_{timestamp}.jpg"
        filepath = os.path.join(settings.ATTENDANCE_IMAGES_DIR, filename)
        cv2.imwrite(filepath, annotated_image)
        
        logger.info(f"Multiple attendance marked: {len(marked_users)} users")
        
        return {
            "message": f"Attendance marked for {len(marked_users)} user(s)",
            "total_faces_detected": len(detected_faces),
            "marked_users": marked_users,
            "image_path": filepath
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking multiple attendance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing attendance: {str(e)}"
        )

@router.get("/today", response_model=list[AttendanceResponse])
async def get_today_attendance(
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """Get today's attendance records (Admin only)"""
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    # Check if user is admin
    user = await user_service.get_user_by_email(email)
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    today = date.today()
    attendances = await attendance_service.get_attendance_by_date(today)
    return attendances

@router.get("/date/{target_date}", response_model=list[AttendanceResponse])
async def get_attendance_by_date(
    target_date: date,
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """Get attendance records for a specific date (Admin only)"""
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    # Check if user is admin
    user = await user_service.get_user_by_email(email)
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    attendances = await attendance_service.get_attendance_by_date(target_date)
    return attendances

@router.get("/my-attendance", response_model=list[AttendanceResponse])
async def get_my_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """Get current user's attendance records"""
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    user = await user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    attendances = await attendance_service.get_attendance_by_user(
        str(user.id),
        start_date,
        end_date
    )
    return attendances

@router.get("/stats", response_model=AttendanceStats)
async def get_my_stats(
    days: int = 30,
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """Get current user's attendance statistics"""
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    user = await user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    stats = await attendance_service.get_user_stats(str(user.id), days)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate statistics"
        )
    
    return stats

@router.get("/report/daily/{target_date}", response_model=DailyAttendanceReport)
async def get_daily_report(
    target_date: date,
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """Generate daily attendance report (Admin only)"""
    user_service = UserService(db)
    attendance_service = AttendanceService(db)
    
    # Check if user is admin
    user = await user_service.get_user_by_email(email)
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    report = await attendance_service.get_daily_report(target_date)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report"
        )
    
    return report
