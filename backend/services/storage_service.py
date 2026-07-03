from supabase import Client
from typing import Optional, Dict, Any
import mimetypes
import os

class StorageService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.bucket_name = "fabric-images"
    
    def upload_file(
        self,
        file_path: str,
        file_content: bytes,
        user_id: str,
        content_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to Supabase Storage
        """
        try:
            # Determine content type if not provided
            if not content_type:
                content_type, _ = mimetypes.guess_type(file_path)
                if not content_type:
                    content_type = "application/octet-stream"
            
            # Create storage path: user_id/filename
            filename = os.path.basename(file_path)
            storage_path = f"{user_id}/{filename}"
            
            # Upload file
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
            
            return {
                "storage_path": storage_path,
                "public_url": public_url,
                "full_path": result.full_path if hasattr(result, 'full_path') else storage_path
            }
        except Exception as e:
            raise Exception(f"Storage upload failed: {str(e)}")
    
    def delete_file(self, storage_path: str) -> bool:
        """
        Delete a file from Supabase Storage
        """
        try:
            self.supabase.storage.from_(self.bucket_name).remove([storage_path])
            return True
        except Exception as e:
            raise Exception(f"Storage deletion failed: {str(e)}")
    
    def get_public_url(self, storage_path: str) -> str:
        """
        Get public URL for a file
        """
        try:
            return self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
        except Exception as e:
            raise Exception(f"Failed to get public URL: {str(e)}")
    
    def get_signed_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """
        Get signed URL for a file (expires in seconds)
        """
        try:
            return self.supabase.storage.from_(self.bucket_name).create_signed_url(
                storage_path, expires_in
            )["signedURL"]
        except Exception as e:
            raise Exception(f"Failed to create signed URL: {str(e)}")
