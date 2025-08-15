import random
import string
import re
from datetime import datetime, date
from typing import Optional
import secrets

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP (One-Time Password)"""
    return ''.join(random.choices(string.digits, k=length))

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

def format_phone_number(phone: str) -> str:
    """Format phone number to standard format"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Handle Philippine mobile numbers
    if digits.startswith('63'):
        # Already has country code
        return f"+{digits}"
    elif digits.startswith('09'):
        # Local format, add country code
        return f"+63{digits[1:]}"
    elif len(digits) == 10 and digits.startswith('9'):
        # Missing leading zero
        return f"+63{digits}"
    else:
        # Return as is with + prefix if not already present
        return f"+{digits}" if not phone.startswith('+') else phone

def calculate_age(birth_date: date) -> int:
    """Calculate age from birth date"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def generate_reference_number(prefix: str = "REF") -> str:
    """Generate a unique reference number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{timestamp}{random_suffix}"

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace unsafe characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255-len(ext)-1] + '.' + ext if ext else name[:255]
    return filename

def extract_initials(full_name: str) -> str:
    """Extract initials from full name"""
    words = full_name.strip().split()
    return ''.join(word[0].upper() for word in words if word)

def mask_email(email: str) -> str:
    """Mask email address for privacy"""
    if '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 2:
        masked_local = local[0] + '*' * (len(local) - 1)
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"

def mask_phone(phone: str) -> str:
    """Mask phone number for privacy"""
    digits = re.sub(r'\D', '', phone)
    if len(digits) < 4:
        return phone
    
    return phone.replace(digits[2:-2], '*' * len(digits[2:-2]))

def generate_slug(text: str) -> str:
    """Generate URL-friendly slug from text"""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def parse_name(full_name: str) -> dict:
    """Parse full name into components"""
    parts = full_name.strip().split()
    
    if len(parts) == 1:
        return {"first_name": parts[0], "middle_name": "", "last_name": ""}
    elif len(parts) == 2:
        return {"first_name": parts[0], "middle_name": "", "last_name": parts[1]}
    elif len(parts) == 3:
        return {"first_name": parts[0], "middle_name": parts[1], "last_name": parts[2]}
    else:
        return {
            "first_name": parts[0],
            "middle_name": " ".join(parts[1:-1]),
            "last_name": parts[-1]
        }

def is_valid_uuid(uuid_string: str) -> bool:
    """Check if string is a valid UUID"""
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(uuid_string))

def clean_text(text: str) -> str:
    """Clean and normalize text input"""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Remove control characters
    text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
    return text.strip()

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return filename.split('.')[-1].lower() if '.' in filename else ''

def is_image_file(filename: str) -> bool:
    """Check if file is an image based on extension"""
    image_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'}
    return get_file_extension(filename) in image_extensions

def is_document_file(filename: str) -> bool:
    """Check if file is a document based on extension"""
    doc_extensions = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'}
    return get_file_extension(filename) in doc_extensions