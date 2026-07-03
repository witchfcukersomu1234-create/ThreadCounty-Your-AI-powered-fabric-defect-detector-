from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    terms_accepted: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None
    college: Optional[str] = None
    phone: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UploadResponse(BaseModel):
    upload_id: str
    file_url: str
    storage_path: str
    original_filename: str
    file_size: int
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    mime_type: Optional[str] = None
    status: str
    created_at: str
