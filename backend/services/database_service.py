from supabase import Client
from typing import Optional, Dict, Any, List
from datetime import datetime

class DatabaseService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def create_upload(
        self,
        user_id: str,
        file_url: str,
        storage_path: str,
        original_filename: str,
        file_size: int,
        image_width: Optional[int] = None,
        image_height: Optional[int] = None,
        mime_type: Optional[str] = None,
        status: str = "completed"
    ) -> Dict[str, Any]:
        """
        Create an upload record in the database
        """
        try:
            data = {
                "user_id": user_id,
                "file_url": file_url,
                "storage_path": storage_path,
                "original_filename": original_filename,
                "file_size": file_size,
                "image_width": image_width,
                "image_height": image_height,
                "mime_type": mime_type,
                "status": status
            }
            
            result = self.supabase.table("uploads").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to create upload record: {str(e)}")
    
    def get_user_uploads(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get all uploads for a user
        """
        try:
            result = self.supabase.table("uploads")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            raise Exception(f"Failed to get user uploads: {str(e)}")
    
    def get_upload(self, upload_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific upload by ID
        """
        try:
            result = self.supabase.table("uploads")\
                .select("*")\
                .eq("id", upload_id)\
                .single()\
                .execute()
            return result.data if result.data else None
        except Exception as e:
            raise Exception(f"Failed to get upload: {str(e)}")
    
    def delete_upload(self, upload_id: str, user_id: str) -> bool:
        """
        Delete an upload (only if owned by the user)
        """
        try:
            # First verify ownership
            upload = self.get_upload(upload_id)
            if not upload:
                raise Exception("Upload not found")
            if upload["user_id"] != user_id:
                raise Exception("Not authorized to delete this upload")
            
            # Delete from database
            self.supabase.table("uploads").delete().eq("id", upload_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete upload: {str(e)}")
    
    def get_all_uploads(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all uploads (admin only)
        """
        try:
            result = self.supabase.table("uploads")\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            raise Exception(f"Failed to get all uploads: {str(e)}")
    
    def create_activity_log(
        self,
        user_id: str,
        action: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create an activity log entry
        """
        try:
            data = {
                "user_id": user_id,
                "action": action,
                "metadata": metadata or {}
            }
            result = self.supabase.table("activity_logs").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            # Don't raise error for activity logs to avoid breaking main flow
            print(f"Failed to create activity log: {str(e)}")
            return None
    
    def create_analysis_result(
        self,
        upload_id: str,
        material: Optional[str] = None,
        density: Optional[str] = None,
        defect_prob: Optional[str] = None,
        micron_count: Optional[str] = None,
        confidence: Optional[str] = None,
        gemini_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create an analysis result record
        """
        try:
            data = {
                "upload_id": upload_id,
                "material": material,
                "density": density,
                "defect_prob": defect_prob,
                "micron_count": micron_count,
                "confidence": confidence,
                "gemini_summary": gemini_summary
            }
            result = self.supabase.table("analysis_results").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            raise Exception(f"Failed to create analysis result: {str(e)}")
    
    def get_analysis_result(self, upload_id: str) -> Optional[Dict[str, Any]]:
        """
        Get analysis result for an upload
        """
        try:
            result = self.supabase.table("analysis_results")\
                .select("*")\
                .eq("upload_id", upload_id)\
                .single()\
                .execute()
            return result.data if result.data else None
        except Exception as e:
            raise Exception(f"Failed to get analysis result: {str(e)}")
