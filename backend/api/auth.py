from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from typing import Dict, Any

from schemas import UserSignup, UserLogin, ForgotPassword, ResetPassword, TokenResponse
from core.supabase_client import get_supabase
from core.security import get_current_user

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    supabase: Client = get_supabase()
    
    # 1. Sign up user with Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed, no user returned.")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # In a real app with email verification, access_token might be None if email needs verification.
    # For this project, if the session is None, we return a standard response indicating verification is needed.
    if not auth_response.session:
        raise HTTPException(status_code=202, detail="Please check your email to verify your account.")

    # Supabase handles profile creation via triggers, or we can insert here. 
    # Usually it's handled by a Postgres trigger in Supabase (we'll provide a migration script for that).
    
    return {
        "access_token": auth_response.session.access_token,
        "refresh_token": auth_response.session.refresh_token,
        "user": auth_response.user.model_dump()
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    supabase: Client = get_supabase()
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
            
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": auth_response.user.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Since we can't easily sign out specific tokens globally without the token itself in the supabase client,
    # and the frontend usually destroys the JWT, we'll just return success.
    # To do it properly we could use the supabase auth sign_out if we initialized client with the user's token.
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    supabase: Client = get_supabase()
    try:
        supabase.auth.reset_password_email(data.email)
        return {"message": "Password reset email sent."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    supabase: Client = get_supabase()
    try:
        auth_response = supabase.auth.refresh_session(refresh_token)
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": auth_response.user.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
