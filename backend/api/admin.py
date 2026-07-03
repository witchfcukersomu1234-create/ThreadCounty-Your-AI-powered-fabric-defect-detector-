from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import Dict, Any

from schemas import AdminLogin, TokenResponse
from core.supabase_client import get_supabase
from core.security import get_current_admin

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    supabase: Client = get_supabase()
    
    try:
        # First sign in
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
            
        # Then verify role
        user_id = auth_response.user.id
        profile_res = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
        
        if profile_res.data and profile_res.data.get("role") == "admin":
            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "user": auth_response.user.model_dump()
            }
        else:
            # Not an admin, logout
            # Since we can't easily sign out specific tokens globally without the token, 
            # we just reject the request.
            raise HTTPException(status_code=403, detail="User is not an admin")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/users")
async def get_users(admin: Dict[str, Any] = Depends(get_current_admin)):
    supabase: Client = get_supabase()
    try:
        # Service role can list users
        response = supabase.auth.admin.list_users()
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: str, admin: Dict[str, Any] = Depends(get_current_admin)):
    supabase: Client = get_supabase()
    try:
        supabase.auth.admin.delete_user(user_id)
        return {"message": f"User {user_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/statistics")
async def get_statistics(admin: Dict[str, Any] = Depends(get_current_admin)):
    supabase: Client = get_supabase()
    try:
        users = supabase.auth.admin.list_users()
        total_users = len(users.users) if hasattr(users, 'users') else 0
        
        # In a real app we'd fetch uploads from a table, etc.
        # For now, we mock the stats as requested or fetch from tables.
        stats = {
            "total_users": total_users,
            "todays_uploads": 0,
            "storage_usage": "0 MB"
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/activity")
async def get_activity(admin: Dict[str, Any] = Depends(get_current_admin)):
    supabase: Client = get_supabase()
    try:
        # Return empty list or fetch from activity_logs
        res = supabase.table("activity_logs").select("*").order("created_at", desc=True).limit(50).execute()
        return res.data
    except Exception as e:
        return []
