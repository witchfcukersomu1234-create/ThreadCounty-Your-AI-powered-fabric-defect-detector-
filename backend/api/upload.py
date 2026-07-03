from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from supabase import Client
from typing import Dict, Any, List

from schemas import ProfileUpdate
from core.supabase_client import get_supabase
from core.security import get_current_user, get_current_admin
from services.upload_service import UploadService

router = APIRouter()

@router.post("/")
async def upload_image(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload an image to Supabase Storage and save metadata to database
    """
    supabase: Client = get_supabase()
    upload_service = UploadService(supabase)
    user_id = current_user.get("id")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file is not empty
        if not file_content:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Upload image
        result = upload_service.upload_image(
            file_content=file_content,
            filename=file.filename,
            user_id=user_id,
            compress=True
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_uploads(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get all uploads for the current user
    """
    supabase: Client = get_supabase()
    upload_service = UploadService(supabase)
    user_id = current_user.get("id")
    
    try:
        uploads = upload_service.get_user_uploads(user_id)
        return {
            "success": True,
            "data": uploads
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{upload_id}")
async def get_upload(
    upload_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific upload by ID
    """
    supabase: Client = get_supabase()
    upload_service = UploadService(supabase)
    user_id = current_user.get("id")
    
    try:
        upload = upload_service.get_upload(upload_id)
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        # Verify ownership
        if upload["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this upload")
        
        return {
            "success": True,
            "data": upload
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{upload_id}")
async def delete_upload(
    upload_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a specific upload (only if owned by the user)
    """
    supabase: Client = get_supabase()
    upload_service = UploadService(supabase)
    user_id = current_user.get("id")
    
    try:
        upload_service.delete_upload(upload_id, user_id)
        return {
            "success": True,
            "message": "Upload deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/all")
async def get_all_uploads(
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Get all uploads (admin only)
    """
    supabase: Client = get_supabase()
    upload_service = UploadService(supabase)
    
    try:
        uploads = upload_service.database_service.get_all_uploads()
        return {
            "success": True,
            "data": uploads
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
