import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, profile, admin, upload, analyze
from core.middleware import LoggingMiddleware, ErrorHandlingMiddleware

app = FastAPI(title="ThreadCounty API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])

@app.get("/")
async def root():
    return {"message": "ThreadCounty API is running"}
