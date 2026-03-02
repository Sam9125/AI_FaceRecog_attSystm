from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys

from config import settings
from database import Database
from routes import auth, face_registration, attendance

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting AI Face Recognition Attendance System...")
    Database.connect_db()
    logger.info("Application started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    Database.close_db()
    logger.info("Application shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="AI Face Recognition Attendance System",
    description="Production-level attendance system using face recognition",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(face_registration.router)
app.include_router(attendance.router)

# Mount static files for serving images (optional, for development)
try:
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as e:
    logger.warning(f"Could not mount uploads directory: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Face Recognition Attendance System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "disconnected"
    app_status = "healthy"
    status_code = 200

    try:
        if Database.client:
            Database.client.admin.command("ping")
            db_status = "connected"
        else:
            app_status = "unhealthy"
            status_code = 503
    except Exception:
        app_status = "unhealthy"
        status_code = 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": app_status,
            "database": db_status
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
