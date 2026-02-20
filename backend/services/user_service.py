from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pymongo.database import Database
from models.user import UserCreate, UserInDB, UserResponse
from utils.security import get_password_hash, verify_password
import logging

logger = logging.getLogger(__name__)

class UserService:
    """Service for user management operations"""
    
    def __init__(self, db: Database):
        self.db = db
        self.collection = db.users
    
    async def create_user(self, user: UserCreate) -> Optional[UserInDB]:
        """Create a new user"""
        try:
            # Check if user already exists
            existing_user = self.collection.find_one({"email": user.email})
            if existing_user:
                logger.warning(f"User with email {user.email} already exists")
                return None
            
            # Create user document
            user_dict = {
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "hashed_password": get_password_hash(user.password),
                "face_encoding": None,
                "face_image_path": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True
            }
            
            result = self.collection.insert_one(user_dict)
            user_dict["_id"] = str(result.inserted_id)
            
            logger.info(f"User created: {user.email}")
            return UserInDB(**user_dict)
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        try:
            user_dict = self.collection.find_one({"email": email})
            if user_dict:
                user_dict["_id"] = str(user_dict["_id"])
                return UserInDB(**user_dict)
            return None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        try:
            user_dict = self.collection.find_one({"_id": ObjectId(user_id)})
            if user_dict:
                user_dict["_id"] = str(user_dict["_id"])
                return UserInDB(**user_dict)
            return None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    async def update_face_encoding(self, user_id: str, face_encoding: List[float], 
                                   image_path: str) -> bool:
        """Update user's face encoding"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "face_encoding": face_encoding,
                        "face_image_path": image_path,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating face encoding: {e}")
            return False
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users"""
        try:
            users = []
            cursor = self.collection.find().skip(skip).limit(limit)
            
            for user_dict in cursor:
                # Convert ObjectId to string before creating UserInDB
                user_dict["_id"] = str(user_dict["_id"])
                user = UserInDB(**user_dict)
                users.append(UserResponse(
                    id=user_dict["_id"],
                    name=user.name,
                    email=user.email,
                    role=user.role,
                    has_face_registered=user.face_encoding is not None,
                    created_at=user.created_at,
                    is_active=user.is_active
                ))
            
            return users
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
    
    async def get_users_with_face_encodings(self) -> List[UserInDB]:
        """Get all users who have registered faces"""
        try:
            users = []
            cursor = self.collection.find({"face_encoding": {"$ne": None}})
            
            for user_dict in cursor:
                user_dict["_id"] = str(user_dict["_id"])
                users.append(UserInDB(**user_dict))
            
            return users
        except Exception as e:
            logger.error(f"Error getting users with face encodings: {e}")
            return []
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return False
