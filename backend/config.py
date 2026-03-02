from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os

class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "attendance_system"
    
    # Face Recognition
    FACE_RECOGNITION_TOLERANCE: float = 0.6
    MIN_CONFIDENCE_THRESHOLD: float = 0.5
    MAX_FACES_PER_FRAME: int = 10
    
    # Attendance
    ATTENDANCE_COOLDOWN_HOURS: int = 8
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    FACE_IMAGES_DIR: str = "./uploads/faces"
    ATTENDANCE_IMAGES_DIR: str = "./uploads/attendance"
    
    # CORS
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://localhost,"
        "https://localhost,"
        "capacitor://localhost"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        """Allow common string values from shell env (e.g. DEBUG=release)."""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "dev", "development"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "prod", "production"}:
                return False
        return bool(value)
    
    def get_allowed_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        else:
            origins = list(self.ALLOWED_ORIGINS)

        # Keep Capacitor localhost origins available for mobile builds.
        for mobile_origin in ("capacitor://localhost", "https://localhost", "http://localhost"):
            if mobile_origin not in origins:
                origins.append(mobile_origin)

        return origins

settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.FACE_IMAGES_DIR, exist_ok=True)
os.makedirs(settings.ATTENDANCE_IMAGES_DIR, exist_ok=True)
