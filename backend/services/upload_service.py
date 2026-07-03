from supabase import Client
from typing import Optional, Dict, Any, Tuple
from PIL import Image
import io
import mimetypes
import os

from .storage_service import StorageService
from .database_service import DatabaseService

class UploadService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.storage_service = StorageService(supabase)
        self.database_service = DatabaseService(supabase)
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_mime_types = ["image/jpeg", "image/png", "image/webp"]
    
    def validate_file(self, file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """
        Validate file size and type
        """
        # Check file size
        if len(file_content) > self.max_file_size:
            return False, f"File size exceeds maximum of {self.max_file_size / (1024 * 1024)}MB"
        
        # Check MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type not in self.allowed_mime_types:
            return False, f"File type {mime_type} not allowed. Allowed types: {', '.join(self.allowed_mime_types)}"
        
        return True, None
    
    def get_image_dimensions(self, file_content: bytes) -> Tuple[int, int]:
        """
        Get image width and height
        """
        try:
            image = Image.open(io.BytesIO(file_content))
            return image.size
        except Exception as e:
            raise Exception(f"Failed to read image dimensions: {str(e)}")
    
    def compress_image(self, file_content: bytes, max_size: int = 2048) -> bytes:
        """
        Compress image if needed (resize if dimensions exceed max_size)
        """
        try:
            image = Image.open(io.BytesIO(file_content))
            width, height = image.size
            
            # Resize if needed
            if width > max_size or height > max_size:
                if width > height:
                    new_width = max_size
                    new_height = int(height * (max_size / width))
                else:
                    new_height = max_size
                    new_width = int(width * (max_size / height))
                
                image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save to bytes
            output = io.BytesIO()
            format_map = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}
            mime_type, _ = mimetypes.guess_type("temp.jpg")
            # Use original format or default to JPEG
            img_format = format_map.get(mime_type, "JPEG")
            
            image.save(output, format=img_format, quality=85)
            return output.getvalue()
        except Exception as e:
            raise Exception(f"Failed to compress image: {str(e)}")
    
    def upload_image(
        self,
        file_content: bytes,
        filename: str,
        user_id: str,
        compress: bool = True
    ) -> Dict[str, Any]:
        """
        Complete upload process: validate, compress, upload to storage, save to database
        """
        # Validate file
        is_valid, error_msg = self.validate_file(file_content, filename)
        if not is_valid:
            raise Exception(error_msg)
        
        # Get MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        
        # Get image dimensions
        width, height = self.get_image_dimensions(file_content)
        
        # Compress if needed
        if compress:
            file_content = self.compress_image(file_content)
        
        # Upload to storage
        storage_result = self.storage_service.upload_file(
            file_path=filename,
            file_content=file_content,
            user_id=user_id,
            content_type=mime_type
        )
        
        # Save to database
        upload_record = self.database_service.create_upload(
            user_id=user_id,
            file_url=storage_result["public_url"],
            storage_path=storage_result["storage_path"],
            original_filename=filename,
            file_size=len(file_content),
            image_width=width,
            image_height=height,
            mime_type=mime_type,
            status="completed"
        )
        
        # Log activity
        self.database_service.create_activity_log(
            user_id=user_id,
            action="upload_created",
            metadata={"upload_id": upload_record["id"], "filename": filename}
        )
        
        return {
            "upload_id": upload_record["id"],
            "file_url": upload_record["file_url"],
            "storage_path": upload_record["storage_path"],
            "original_filename": upload_record["original_filename"],
            "file_size": upload_record["file_size"],
            "image_width": upload_record["image_width"],
            "image_height": upload_record["image_height"],
            "mime_type": upload_record["mime_type"],
            "status": upload_record["status"],
            "created_at": upload_record["created_at"]
        }
    
    def delete_upload(self, upload_id: str, user_id: str) -> bool:
        """
        Delete upload from both storage and database
        """
        # Get upload record
        upload = self.database_service.get_upload(upload_id)
        if not upload:
            raise Exception("Upload not found")
        
        # Verify ownership
        if upload["user_id"] != user_id:
            raise Exception("Not authorized to delete this upload")
        
        # Delete from storage
        if upload["storage_path"]:
            self.storage_service.delete_file(upload["storage_path"])
        
        # Delete from database
        self.database_service.delete_upload(upload_id, user_id)
        
        # Log activity
        self.database_service.create_activity_log(
            user_id=user_id,
            action="upload_deleted",
            metadata={"upload_id": upload_id}
        )
        
        return True
    
    def get_user_uploads(self, user_id: str, limit: int = 50) -> list:
        """
        Get all uploads for a user
        """
        return self.database_service.get_user_uploads(user_id, limit)
    
    def get_upload(self, upload_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific upload
        """
        return self.database_service.get_upload(upload_id)
