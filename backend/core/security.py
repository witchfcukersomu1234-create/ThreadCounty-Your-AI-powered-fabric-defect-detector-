from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from .supabase_client import get_supabase
from typing import Dict, Any

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    supabase: Client = get_supabase()
    
    # Verify token by fetching user from Supabase
    try:
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # return a dict representation of the user
        return response.user.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    supabase: Client = get_supabase()
    # Check role from profiles or admins table
    user_id = current_user.get("id")
    try:
        response = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
        role = response.data.get("role")
        if role != "admin":
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    except Exception as e:
        raise HTTPException(status_code=403, detail="Not enough permissions")
