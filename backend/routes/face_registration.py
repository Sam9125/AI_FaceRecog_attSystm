from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from database import get_db
from services.user_service import UserService
from utils.face_recognition_utils import FaceRecognitionService
from utils.security import get_current_user_email
from config import settings
import cv2
import numpy as np
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/face", tags=["Face Registration"])

face_service = FaceRecognitionService()

@router.post("/register")
async def register_face(
    file: UploadFile = File(...),
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """
    Register face for the current user
    Upload an image with a clear face
    """
    user_service = UserService(db)
    
    # Get current user
    user = await user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
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
                detail="No face detected in the image. Please upload a clear face photo."
            )
        
        if len(face_locations) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple faces detected. Please upload an image with only one face."
            )
        
        # Encode face
        face_encoding = face_service.encode_face(image, face_locations[0])
        
        if face_encoding is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to encode face. Please try with a different image."
            )
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user.id}_{timestamp}.jpg"
        filepath = os.path.join(settings.FACE_IMAGES_DIR, filename)
        cv2.imwrite(filepath, image)
        
        # Update user with face encoding
        success = await user_service.update_face_encoding(
            str(user.id),
            face_encoding,
            filepath
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save face encoding"
            )
        
        logger.info(f"Face registered for user: {email}")
        
        return {
            "message": "Face registered successfully",
            "user_id": str(user.id),
            "face_image_path": filepath
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering face: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/register-multiple")
async def register_face_multiple_images(
    files: list[UploadFile] = File(...),
    email: str = Depends(get_current_user_email),
    db=Depends(get_db)
):
    """
    Register face using multiple images for better accuracy
    Upload 3-5 images of the same person from different angles
    """
    user_service = UserService(db)
    
    # Get current user
    user = await user_service.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if len(files) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload at least 2 images"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed"
        )
    
    try:
        encodings = []
        saved_images = []
        
        for idx, file in enumerate(files):
            # Read image
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                continue
            
            # Detect and encode face
            face_locations = face_service.detect_faces(image)
            
            if len(face_locations) != 1:
                continue
            
            face_encoding = face_service.encode_face(image, face_locations[0])
            
            if face_encoding:
                encodings.append(face_encoding)
                
                # Save image
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{user.id}_{timestamp}_{idx}.jpg"
                filepath = os.path.join(settings.FACE_IMAGES_DIR, filename)
                cv2.imwrite(filepath, image)
                saved_images.append(filepath)
        
        if len(encodings) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid faces detected in any image"
            )
        
        # Average the encodings for better accuracy
        avg_encoding = np.mean(encodings, axis=0).tolist()
        
        # Update user with averaged face encoding
        success = await user_service.update_face_encoding(
            str(user.id),
            avg_encoding,
            saved_images[0]  # Save path of first image
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save face encoding"
            )
        
        logger.info(f"Face registered with {len(encodings)} images for user: {email}")
        
        return {
            "message": f"Face registered successfully using {len(encodings)} images",
            "user_id": str(user.id),
            "images_processed": len(encodings),
            "saved_images": saved_images
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering face: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing images: {str(e)}"
        )
