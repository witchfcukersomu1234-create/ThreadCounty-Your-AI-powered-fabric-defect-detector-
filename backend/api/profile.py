from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import Dict, Any

from schemas import ProfileUpdate
from core.supabase_client import get_supabase
from core.security import get_current_user

router = APIRouter()

@router.get("/")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    supabase: Client = get_supabase()
    user_id = current_user.get("id")
    
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
        # Merge auth user info with profile data
        profile_data = response.data
        return {
            "id": user_id,
            "email": current_user.get("email"),
            "full_name": profile_data.get("full_name") if profile_data else None,
            "avatar_url": profile_data.get("avatar_url") if profile_data else None,
            "role": profile_data.get("role", "user") if profile_data else "user",
            "college": profile_data.get("college") if profile_data else None,
            "phone": profile_data.get("phone") if profile_data else None,
            "created_at": current_user.get("created_at")
        }
    except Exception as e:
        # If profile doesn't exist yet, just return the user info
        return {
            "id": user_id,
            "email": current_user.get("email"),
            "full_name": current_user.get("user_metadata", {}).get("full_name"),
            "role": "user",
            "college": None,
            "phone": None
        }

@router.patch("/")
async def update_profile(profile_data: ProfileUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    supabase: Client = get_supabase()
    user_id = current_user.get("id")
    
    update_dict = {}
    if profile_data.full_name is not None:
        update_dict["full_name"] = profile_data.full_name
    if profile_data.avatar_url is not None:
        update_dict["avatar_url"] = profile_data.avatar_url
    if profile_data.college is not None:
        update_dict["college"] = profile_data.college
    if profile_data.phone is not None:
        update_dict["phone"] = profile_data.phone
    update_dict["updated_at"] = "now()"
        
    try:
        if update_dict:
            supabase.table("profiles").update(update_dict).eq("id", user_id).execute()
            
        if profile_data.password:
            # Update password using admin api or if we require the user's token, we'd do it differently.
            # Usually password update requires the user to be logged in with that token, 
            # here we might need to rely on supabase's updateUser if we had their token, 
            # but since we use service role we can force update:
            supabase.auth.admin.update_user_by_id(user_id, {"password": profile_data.password})
            
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
