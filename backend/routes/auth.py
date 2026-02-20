from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from database import get_db
from models.user import UserCreate, UserResponse, Token
from services.user_service import UserService
from utils.security import create_access_token, get_current_user_email
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db=Depends(get_db)):
    """Register a new user"""
    user_service = UserService(db)
    
    # Create user
    created_user = await user_service.create_user(user)
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    return UserResponse(
        id=str(created_user.id),
        name=created_user.name,
        email=created_user.email,
        role=created_user.role,
        has_face_registered=False,
        created_at=created_user.created_at,
        is_active=created_user.is_active
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """Login and get access token"""
    user_service = UserService(db)
    
    # Authenticate user
    user = await user_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(email: str = Depends(get_current_user_email), db=Depends(get_db)):
    """Get current logged-in user"""
    user_service = UserService(db)
    user = await user_service.get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        has_face_registered=user.face_encoding is not None,
        created_at=user.created_at,
        is_active=user.is_active
    )

@router.get("/users", response_model=list[UserResponse])
async def get_all_users(email: str = Depends(get_current_user_email), db=Depends(get_db)):
    """Get all users (Admin only)"""
    user_service = UserService(db)
    
    # Check if current user is admin
    current_user = await user_service.get_user_by_email(email)
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )
    
    # Get all users
    users = await user_service.get_all_users()
    return users
