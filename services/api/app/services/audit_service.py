from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
import json

class AuditService:
    """Complete audit logging service"""
    
    def log_action(
        self,
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[int] = None,
        resource_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        description: Optional[str] = None
    ) -> AuditLog:
        """Log system action for audit trail"""
        
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            description=description,
            created_at=datetime.utcnow()
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    
    def log_user_login(self, db: Session, user_id: int, ip_address: str, user_agent: str, success: bool = True) -> AuditLog:
        """Log user login attempt"""
        action = "USER_LOGIN_SUCCESS" if success else "USER_LOGIN_FAILED"
        return self.log_action(
            db=db,
            user_id=user_id if success else None,
            action=action,
            resource_type="User",
            resource_id=user_id if success else None,
            ip_address=ip_address,
            user_agent=user_agent,
            description="User login attempt"
        )
    
    def log_user_logout(self, db: Session, user_id: int, ip_address: str, user_agent: str) -> AuditLog:
        """Log user logout"""
        return self.log_action(
            db=db,
            user_id=user_id,
            action="USER_LOGOUT",
            resource_type="User",
            resource_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            description="User logout"
        )
    
    def log_password_change(self, db: Session, user_id: int, ip_address: str, user_agent: str) -> AuditLog:
        """Log password change"""
        return self.log_action(
            db=db,
            user_id=user_id,
            action="PASSWORD_CHANGED",
            resource_type="User",
            resource_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            description="User password changed"
        )
    
    def log_data_export(self, db: Session, user_id: int, export_type: str, record_count: int, ip_address: str) -> AuditLog:
        """Log data export activity"""
        return self.log_action(
            db=db,
            user_id=user_id,
            action="DATA_EXPORTED",
            resource_type="System",
            ip_address=ip_address,
            new_values={"export_type": export_type, "record_count": record_count},
            description=f"Exported {record_count} {export_type} records"
        )
    
    def log_admin_action(self, db: Session, admin_user_id: int, action: str, target_user_id: int, details: str, ip_address: str) -> AuditLog:
        """Log administrative actions"""
        return self.log_action(
            db=db,
            user_id=admin_user_id,
            action=f"ADMIN_{action}",
            resource_type="User",
            resource_id=target_user_id,
            ip_address=ip_address,
            description=f"Admin action: {details}"
        )
    
    def get_user_audit_trail(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        """Get audit trail for specific user"""
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_resource_audit_trail(self, db: Session, resource_type: str, resource_id: int, skip: int = 0, limit: int = 100):
        """Get audit trail for specific resource"""
        return db.query(AuditLog).filter(
            AuditLog.resource_type == resource_type,
            AuditLog.resource_id == resource_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_system_audit_trail(self, db: Session, action_filter: Optional[str] = None, skip: int = 0, limit: int = 100):
        """Get system-wide audit trail"""
        query = db.query(AuditLog)
        
        if action_filter:
            query = query.filter(AuditLog.action.contains(action_filter))
        
        return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

audit_service = AuditService()