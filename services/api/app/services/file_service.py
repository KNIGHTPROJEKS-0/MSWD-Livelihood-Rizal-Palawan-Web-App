"""File Service for handling file operations"""
import os
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.utils.validators import validate_file_upload
from app.utils.formatters import format_file_size
from app.utils.helpers import sanitize_filename, get_file_extension, is_image_file, is_document_file

class FileService:
    """Service for handling file operations"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR if hasattr(settings, 'UPLOAD_DIR') else "uploads")
        self.max_file_size = getattr(settings, 'MAX_FILE_SIZE', 10 * 1024 * 1024)  # 10MB default
        self.allowed_extensions = getattr(settings, 'ALLOWED_FILE_EXTENSIONS', [
            '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'
        ])
        
        # Create upload directory if it doesn't exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def upload_file(
        self, 
        file: UploadFile, 
        subfolder: str = "general",
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Upload a file and return file information"""
        # Validate file
        validation_result = validate_file_upload(file, self.max_file_size, self.allowed_extensions)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation_result["message"]
            )
        
        # Generate unique filename
        file_extension = get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        sanitized_original = sanitize_filename(file.filename)
        
        # Create subfolder path
        subfolder_path = self.upload_dir / subfolder
        subfolder_path.mkdir(parents=True, exist_ok=True)
        
        # Full file path
        file_path = subfolder_path / unique_filename
        
        try:
            # Save file
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Get file info
            file_size = len(content)
            file_info = {
                "id": str(uuid.uuid4()),
                "original_filename": sanitized_original,
                "stored_filename": unique_filename,
                "file_path": str(file_path),
                "relative_path": f"{subfolder}/{unique_filename}",
                "file_size": file_size,
                "file_size_formatted": format_file_size(file_size),
                "content_type": file.content_type,
                "file_extension": file_extension,
                "is_image": is_image_file(file.filename),
                "is_document": is_document_file(file.filename),
                "uploaded_at": datetime.utcnow().isoformat(),
                "uploaded_by": user_id,
                "subfolder": subfolder
            }
            
            return file_info
            
        except Exception as e:
            # Clean up file if something went wrong
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            full_path = Path(file_path)
            if full_path.exists() and full_path.is_file():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get information about a file"""
        try:
            full_path = Path(file_path)
            if not full_path.exists():
                return None
            
            stat = full_path.stat()
            return {
                "filename": full_path.name,
                "file_path": str(full_path),
                "file_size": stat.st_size,
                "file_size_formatted": format_file_size(stat.st_size),
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "file_extension": full_path.suffix,
                "is_image": is_image_file(full_path.name),
                "is_document": is_document_file(full_path.name)
            }
        except Exception:
            return None
    
    def list_files(self, subfolder: str = "general", limit: int = 100) -> List[Dict[str, Any]]:
        """List files in a subfolder"""
        try:
            subfolder_path = self.upload_dir / subfolder
            if not subfolder_path.exists():
                return []
            
            files = []
            for file_path in subfolder_path.iterdir():
                if file_path.is_file():
                    file_info = self.get_file_info(str(file_path))
                    if file_info:
                        files.append(file_info)
                    
                    if len(files) >= limit:
                        break
            
            return sorted(files, key=lambda x: x["modified_at"], reverse=True)
        except Exception:
            return []
    
    def get_file_url(self, relative_path: str) -> str:
        """Get URL for accessing a file"""
        base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
        return f"{base_url}/files/{relative_path}"
    
    def cleanup_old_files(self, days_old: int = 30) -> int:
        """Clean up files older than specified days"""
        try:
            cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
            deleted_count = 0
            
            for root, dirs, files in os.walk(self.upload_dir):
                for file in files:
                    file_path = Path(root) / file
                    if file_path.stat().st_mtime < cutoff_time:
                        try:
                            file_path.unlink()
                            deleted_count += 1
                        except Exception:
                            continue
            
            return deleted_count
        except Exception:
            return 0
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        try:
            total_size = 0
            file_count = 0
            
            for root, dirs, files in os.walk(self.upload_dir):
                for file in files:
                    file_path = Path(root) / file
                    try:
                        total_size += file_path.stat().st_size
                        file_count += 1
                    except Exception:
                        continue
            
            return {
                "total_files": file_count,
                "total_size": total_size,
                "total_size_formatted": format_file_size(total_size),
                "upload_directory": str(self.upload_dir)
            }
        except Exception:
            return {
                "total_files": 0,
                "total_size": 0,
                "total_size_formatted": "0 B",
                "upload_directory": str(self.upload_dir)
            }

# Create service instance
file_service = FileService()