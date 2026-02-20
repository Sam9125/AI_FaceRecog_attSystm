from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime, date as date_type

def get_today():
    return date_type.today()

class AttendanceBase(BaseModel):
    user_id: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    
class AttendanceCreate(AttendanceBase):
    image_path: Optional[str] = None

class AttendanceInDB(AttendanceBase):
    id: Optional[str] = Field(alias="_id", default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    date: date_type = Field(default_factory=get_today)
    image_path: Optional[str] = None
    
    model_config = ConfigDict(populate_by_name=True)

class AttendanceResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    timestamp: datetime
    date: date_type
    confidence: float
    image_path: Optional[str] = None
    
    model_config = ConfigDict(populate_by_name=True)

class AttendanceStats(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    attendance_percentage: float
    recent_attendance: list

class DailyAttendanceReport(BaseModel):
    date: date_type
    total_users: int
    present_count: int
    absent_count: int
    attendance_percentage: float
    present_users: list
    absent_users: list
