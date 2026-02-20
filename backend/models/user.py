from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="user", pattern="^(admin|user)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserRegisterFace(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="user", pattern="^(admin|user)$")
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: Optional[str] = Field(alias="_id", default=None)
    hashed_password: str
    face_encoding: Optional[List[float]] = None
    face_image_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class UserResponse(UserBase):
    id: str
    has_face_registered: bool
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(populate_by_name=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
