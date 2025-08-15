from typing import List, Optional
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import firebase_admin
from firebase_admin import messaging
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Complete notification service for emails and push notifications"""
    
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME or "MSWD Livelihood Program"
    
    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text version if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML version
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, email: str, name: str) -> bool:
        """Send welcome email to new user"""
        subject = "Welcome to MSWD Livelihood Program"
        html_content = f"""
        <html>
        <body>
            <h2>Welcome to MSWD Livelihood Program, {name}!</h2>
            <p>Thank you for joining our livelihood program platform.</p>
            <p>You can now:</p>
            <ul>
                <li>Browse available livelihood programs</li>
                <li>Apply for programs that match your interests</li>
                <li>Track your application status</li>
                <li>Access program resources and materials</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_application_confirmation(self, email: str, name: str, program_name: str) -> bool:
        """Send application confirmation email"""
        subject = f"Application Received - {program_name}"
        html_content = f"""
        <html>
        <body>
            <h2>Application Received</h2>
            <p>Dear {name},</p>
            <p>We have received your application for the <strong>{program_name}</strong> program.</p>
            <p>Your application is currently under review. We will notify you once a decision has been made.</p>
            <p>Application Details:</p>
            <ul>
                <li>Program: {program_name}</li>
                <li>Submitted: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</li>
                <li>Status: Pending Review</li>
            </ul>
            <p>Thank you for your interest in our livelihood programs.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_application_approved(self, email: str, name: str, program_name: str) -> bool:
        """Send application approval email"""
        subject = f"Application Approved - {program_name}"
        html_content = f"""
        <html>
        <body>
            <h2>Congratulations! Your Application Has Been Approved</h2>
            <p>Dear {name},</p>
            <p>We are pleased to inform you that your application for the <strong>{program_name}</strong> program has been approved!</p>
            <p>Next Steps:</p>
            <ol>
                <li>You will receive additional information about program orientation</li>
                <li>Please prepare the required documents as specified in the program requirements</li>
                <li>Attend the scheduled orientation session</li>
            </ol>
            <p>We look forward to having you in our program and supporting your livelihood journey.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_application_rejected(self, email: str, name: str, program_name: str, reason: Optional[str] = None) -> bool:
        """Send application rejection email"""
        subject = f"Application Update - {program_name}"
        
        reason_text = f"<p>Reason: {reason}</p>" if reason else ""
        
        html_content = f"""
        <html>
        <body>
            <h2>Application Update</h2>
            <p>Dear {name},</p>
            <p>Thank you for your interest in the <strong>{program_name}</strong> program.</p>
            <p>After careful review, we regret to inform you that your application was not selected for this program cycle.</p>
            {reason_text}
            <p>We encourage you to:</p>
            <ul>
                <li>Apply for other available programs that match your profile</li>
                <li>Attend our skills assessment workshops</li>
                <li>Reapply in future program cycles</li>
            </ul>
            <p>Thank you for your understanding, and we hope to assist you in future opportunities.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_program_reminder(self, email: str, name: str, program_name: str, reminder_type: str, details: str) -> bool:
        """Send program-related reminders"""
        subject = f"Reminder: {program_name} - {reminder_type}"
        html_content = f"""
        <html>
        <body>
            <h2>Program Reminder</h2>
            <p>Dear {name},</p>
            <p>This is a reminder regarding your participation in the <strong>{program_name}</strong> program.</p>
            <p><strong>{reminder_type}</strong></p>
            <p>{details}</p>
            <p>If you have any questions, please contact your program coordinator.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_bulk_notification(self, recipients: List[str], subject: str, html_content: str) -> dict:
        """Send bulk notifications"""
        results = {"success": 0, "failed": 0, "errors": []}
        
        for email in recipients:
            try:
                if self._send_email(email, subject, html_content):
                    results["success"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append(f"Failed to send to {email}")
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"Error sending to {email}: {str(e)}")
        
        return results
    
    def send_push_notification(self, device_token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
        """Send push notification via Firebase"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=device_token,
            )
            
            response = messaging.send(message)
            logger.info(f"Push notification sent successfully: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            return False
    
    def send_system_alert(self, admin_emails: List[str], alert_type: str, message: str) -> bool:
        """Send system alerts to administrators"""
        subject = f"System Alert: {alert_type}"
        html_content = f"""
        <html>
        <body>
            <h2>System Alert</h2>
            <p><strong>Alert Type:</strong> {alert_type}</p>
            <p><strong>Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
            <p>Please investigate and take appropriate action if necessary.</p>
            <p>MSWD System</p>
        </body>
        </html>
        """
        
        results = self.send_bulk_notification(admin_emails, subject, html_content)
        return results["success"] > 0
    
    def send_enrollment_confirmation(self, email: str, name: str, program_name: str) -> bool:
        """Send enrollment confirmation email"""
        subject = f"Enrollment Confirmed - {program_name}"
        html_content = f"""
        <html>
        <body>
            <h2>Enrollment Confirmed</h2>
            <p>Dear {name},</p>
            <p>Congratulations! You have been successfully enrolled in the <strong>{program_name}</strong> program.</p>
            <p>Enrollment Details:</p>
            <ul>
                <li>Program: {program_name}</li>
                <li>Enrollment Date: {datetime.now().strftime('%B %d, %Y')}</li>
                <li>Status: Active</li>
            </ul>
            <p>You will receive further instructions and program materials soon.</p>
            <p>Welcome to the program!</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)
    
    def send_program_completion(self, email: str, name: str, program_name: str) -> bool:
        """Send program completion email"""
        subject = f"Program Completed - {program_name}"
        html_content = f"""
        <html>
        <body>
            <h2>Congratulations on Your Program Completion!</h2>
            <p>Dear {name},</p>
            <p>We are pleased to inform you that you have successfully completed the <strong>{program_name}</strong> program.</p>
            <p>Completion Details:</p>
            <ul>
                <li>Program: {program_name}</li>
                <li>Completion Date: {datetime.now().strftime('%B %d, %Y')}</li>
                <li>Status: Completed</li>
            </ul>
            <p>Your certificate and completion documents will be processed and made available soon.</p>
            <p>Thank you for your dedication and participation in our livelihood program.</p>
            <p>Best regards,<br>MSWD Livelihood Program Team</p>
        </body>
        </html>
        """
        
        return self._send_email(email, subject, html_content)

notification_service = NotificationService()