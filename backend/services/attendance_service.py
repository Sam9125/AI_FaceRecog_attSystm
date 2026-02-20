from typing import Optional, List
from datetime import datetime, date, timedelta
from bson import ObjectId
from pymongo.database import Database
from models.attendance import AttendanceCreate, AttendanceInDB, AttendanceResponse, AttendanceStats, DailyAttendanceReport
from config import settings
import logging

logger = logging.getLogger(__name__)

class AttendanceService:
    """Service for attendance management operations"""
    
    def __init__(self, db: Database):
        self.db = db
        self.collection = db.attendance
        self.users_collection = db.users
    
    async def mark_attendance(self, attendance: AttendanceCreate) -> Optional[AttendanceInDB]:
        """Mark attendance for a user"""
        try:
            # Check if attendance already marked today
            today = date.today()
            today_datetime = datetime.combine(today, datetime.min.time())
            
            existing = self.collection.find_one({
                "user_id": attendance.user_id,
                "date": today_datetime
            })
            
            if existing:
                logger.info(f"Attendance already marked for user {attendance.user_id} today")
                return None
            
            # Create attendance record
            attendance_dict = {
                "user_id": attendance.user_id,
                "confidence": attendance.confidence,
                "timestamp": datetime.utcnow(),
                "date": today_datetime,
                "image_path": attendance.image_path
            }
            
            result = self.collection.insert_one(attendance_dict)
            attendance_dict["_id"] = str(result.inserted_id)
            
            logger.info(f"Attendance marked for user {attendance.user_id}")
            return AttendanceInDB(**attendance_dict)
        except Exception as e:
            logger.error(f"Error marking attendance: {e}")
            return None
    
    async def get_attendance_by_date(self, target_date: date) -> List[AttendanceResponse]:
        """Get all attendance records for a specific date"""
        try:
            attendances = []
            target_datetime = datetime.combine(target_date, datetime.min.time())
            cursor = self.collection.find({"date": target_datetime})
            
            for att_dict in cursor:
                # Get user details
                user = self.users_collection.find_one({"_id": ObjectId(att_dict["user_id"])})
                if user:
                    attendances.append(AttendanceResponse(
                        id=str(att_dict["_id"]),
                        user_id=att_dict["user_id"],
                        user_name=user["name"],
                        user_email=user["email"],
                        timestamp=att_dict["timestamp"],
                        date=att_dict["date"],
                        confidence=att_dict["confidence"],
                        image_path=att_dict.get("image_path")
                    ))
            
            return attendances
        except Exception as e:
            logger.error(f"Error getting attendance by date: {e}")
            return []
    
    async def get_attendance_by_user(self, user_id: str, start_date: Optional[date] = None,
                                    end_date: Optional[date] = None) -> List[AttendanceResponse]:
        """Get attendance records for a specific user"""
        try:
            query = {"user_id": user_id}
            
            if start_date or end_date:
                date_query = {}
                if start_date:
                    date_query["$gte"] = datetime.combine(start_date, datetime.min.time())
                if end_date:
                    date_query["$lte"] = datetime.combine(end_date, datetime.max.time())
                query["date"] = date_query
            
            attendances = []
            cursor = self.collection.find(query).sort("date", -1)
            
            user = self.users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return []
            
            for att_dict in cursor:
                attendances.append(AttendanceResponse(
                    id=str(att_dict["_id"]),
                    user_id=att_dict["user_id"],
                    user_name=user["name"],
                    user_email=user["email"],
                    timestamp=att_dict["timestamp"],
                    date=att_dict["date"],
                    confidence=att_dict["confidence"],
                    image_path=att_dict.get("image_path")
                ))
            
            return attendances
        except Exception as e:
            logger.error(f"Error getting attendance by user: {e}")
            return []
    
    async def get_user_stats(self, user_id: str, days: int = 30) -> Optional[AttendanceStats]:
        """Get attendance statistics for a user"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            # Get attendance records
            records = await self.get_attendance_by_user(user_id, start_date, end_date)
            
            present_days = len(records)
            total_days = days
            absent_days = total_days - present_days
            attendance_percentage = (present_days / total_days) * 100 if total_days > 0 else 0
            
            # Get recent attendance (last 10 records)
            recent = records[:10]
            recent_list = [
                {
                    "date": str(r.date),
                    "timestamp": r.timestamp.isoformat(),
                    "confidence": r.confidence
                }
                for r in recent
            ]
            
            return AttendanceStats(
                total_days=total_days,
                present_days=present_days,
                absent_days=absent_days,
                attendance_percentage=round(attendance_percentage, 2),
                recent_attendance=recent_list
            )
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return None
    
    async def get_daily_report(self, target_date: date) -> Optional[DailyAttendanceReport]:
        """Generate daily attendance report"""
        try:
            # Get all users
            total_users = self.users_collection.count_documents({"is_active": True})
            
            # Get attendance for the day
            attendances = await self.get_attendance_by_date(target_date)
            present_count = len(attendances)
            absent_count = total_users - present_count
            
            attendance_percentage = (present_count / total_users * 100) if total_users > 0 else 0
            
            # Get present users
            present_users = [
                {
                    "user_id": att.user_id,
                    "name": att.user_name,
                    "email": att.user_email,
                    "timestamp": att.timestamp.isoformat(),
                    "confidence": att.confidence
                }
                for att in attendances
            ]
            
            # Get absent users
            present_user_ids = [att.user_id for att in attendances]
            absent_users_cursor = self.users_collection.find({
                "_id": {"$nin": [ObjectId(uid) for uid in present_user_ids]},
                "is_active": True
            })
            
            absent_users = [
                {
                    "user_id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"]
                }
                for user in absent_users_cursor
            ]
            
            return DailyAttendanceReport(
                date=target_date,
                total_users=total_users,
                present_count=present_count,
                absent_count=absent_count,
                attendance_percentage=round(attendance_percentage, 2),
                present_users=present_users,
                absent_users=absent_users
            )
        except Exception as e:
            logger.error(f"Error generating daily report: {e}")
            return None
    
    async def check_attendance_today(self, user_id: str) -> bool:
        """Check if user has marked attendance today"""
        try:
            today = date.today()
            today_datetime = datetime.combine(today, datetime.min.time())
            existing = self.collection.find_one({
                "user_id": user_id,
                "date": today_datetime
            })
            return existing is not None
        except Exception as e:
            logger.error(f"Error checking attendance: {e}")
            return False
