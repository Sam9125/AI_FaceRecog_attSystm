from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: MongoClient = None
    
    @classmethod
    def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
            # Test connection
            cls.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
            # Create indexes
            cls.create_indexes()
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        return cls.client[settings.DATABASE_NAME]
    
    @classmethod
    def create_indexes(cls):
        """Create database indexes for performance"""
        db = cls.get_database()
        
        # Users collection indexes
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.users.create_index([("role", ASCENDING)])
        
        # Attendance collection indexes
        db.attendance.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
        db.attendance.create_index([("date", DESCENDING)])
        db.attendance.create_index([("timestamp", DESCENDING)])
        
        logger.info("Database indexes created successfully")

# Database connection functions
def get_db():
    """Dependency for getting database"""
    return Database.get_database()
