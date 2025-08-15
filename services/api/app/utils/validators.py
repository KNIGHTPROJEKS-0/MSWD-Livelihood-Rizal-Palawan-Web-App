import re
from typing import Optional
from datetime import datetime, date
from email_validator import validate_email as email_validate, EmailNotValidError

def validate_email(email: str) -> bool:
    """Validate email address format"""
    try:
        email_validate(email)
        return True
    except EmailNotValidError:
        return False

def validate_phone(phone: str) -> bool:
    """Validate Philippine phone number format"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Philippine mobile number patterns
    patterns = [
        r'^639\d{9}$',      # +639XXXXXXXXX (with country code)
        r'^09\d{9}$',       # 09XXXXXXXXX (local format)
        r'^9\d{9}$',        # 9XXXXXXXXX (without leading 0)
    ]
    
    for pattern in patterns:
        if re.match(pattern, digits):
            return True
    
    return False

def validate_tin(tin: str) -> bool:
    """Validate Philippine TIN (Tax Identification Number) format"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', tin)
    
    # TIN should be 9 or 12 digits
    if len(digits) not in [9, 12]:
        return False
    
    # Basic format validation (XXX-XXX-XXX or XXX-XXX-XXX-XXX)
    return True

def validate_password_strength(password: str) -> dict:
    """Validate password strength and return detailed feedback"""
    result = {
        "is_valid": False,
        "score": 0,
        "feedback": [],
        "requirements_met": {
            "min_length": False,
            "has_uppercase": False,
            "has_lowercase": False,
            "has_digit": False,
            "has_special": False
        }
    }
    
    if len(password) >= 8:
        result["requirements_met"]["min_length"] = True
        result["score"] += 1
    else:
        result["feedback"].append("Password must be at least 8 characters long")
    
    if re.search(r'[A-Z]', password):
        result["requirements_met"]["has_uppercase"] = True
        result["score"] += 1
    else:
        result["feedback"].append("Password must contain at least one uppercase letter")
    
    if re.search(r'[a-z]', password):
        result["requirements_met"]["has_lowercase"] = True
        result["score"] += 1
    else:
        result["feedback"].append("Password must contain at least one lowercase letter")
    
    if re.search(r'\d', password):
        result["requirements_met"]["has_digit"] = True
        result["score"] += 1
    else:
        result["feedback"].append("Password must contain at least one digit")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result["requirements_met"]["has_special"] = True
        result["score"] += 1
    else:
        result["feedback"].append("Password must contain at least one special character")
    
    # Check for common weak patterns
    weak_patterns = [
        r'123456',
        r'password',
        r'qwerty',
        r'abc123',
        r'admin'
    ]
    
    for pattern in weak_patterns:
        if re.search(pattern, password.lower()):
            result["feedback"].append("Password contains common weak patterns")
            result["score"] -= 1
            break
    
    result["is_valid"] = result["score"] >= 4 and len(result["feedback"]) == 0
    
    return result

def validate_application_notes(notes: str) -> bool:
    """Validate application notes field"""
    if not notes:
        return True  # Notes are optional
    
    # Check length constraints
    if len(notes.strip()) > 1000:
        return False
    
    # Check for inappropriate content (basic validation)
    inappropriate_patterns = [
        r'<script',
        r'javascript:',
        r'<iframe',
        r'<object',
        r'<embed'
    ]
    
    notes_lower = notes.lower()
    for pattern in inappropriate_patterns:
        if re.search(pattern, notes_lower):
            return False
    
    return True

def validate_age(birth_date: date, min_age: int = 18, max_age: int = 100) -> bool:
    """Validate age based on birth date"""
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return min_age <= age <= max_age

def validate_barangay(barangay: str) -> bool:
    """Validate barangay name (basic validation)"""
    if not barangay or len(barangay.strip()) < 2:
        return False
    
    # Check for valid characters (letters, numbers, spaces, hyphens)
    return bool(re.match(r'^[a-zA-Z0-9\s\-\.]+$', barangay.strip()))

def validate_name(name: str, min_length: int = 2, max_length: int = 100) -> bool:
    """Validate person name"""
    if not name or len(name.strip()) < min_length or len(name.strip()) > max_length:
        return False
    
    # Allow letters, spaces, hyphens, apostrophes, and periods
    return bool(re.match(r"^[a-zA-Z\s\-\'\.\.]+$", name.strip()))

def validate_address(address: str, min_length: int = 10, max_length: int = 500) -> bool:
    """Validate address format"""
    if not address or len(address.strip()) < min_length or len(address.strip()) > max_length:
        return False
    
    # Allow letters, numbers, spaces, and common punctuation
    return bool(re.match(r'^[a-zA-Z0-9\s\-\,\.\/\#]+$', address.strip()))

def validate_occupation(occupation: str) -> bool:
    """Validate occupation field"""
    if not occupation or len(occupation.strip()) < 2 or len(occupation.strip()) > 100:
        return False
    
    # Allow letters, spaces, hyphens, and common punctuation
    return bool(re.match(r'^[a-zA-Z\s\-\/\&]+$', occupation.strip()))

def validate_program_title(title: str) -> bool:
    """Validate program title"""
    if not title or len(title.strip()) < 5 or len(title.strip()) > 200:
        return False
    
    # Allow letters, numbers, spaces, and common punctuation
    return bool(re.match(r'^[a-zA-Z0-9\s\-\,\.\/\&\(\)]+$', title.strip()))

def validate_budget_amount(budget: str) -> bool:
    """Validate budget amount format"""
    if not budget:
        return False
    
    # Remove currency symbols and commas
    cleaned = re.sub(r'[₱$,\s]', '', budget)
    
    # Check if it's a valid number
    try:
        amount = float(cleaned)
        return amount > 0
    except ValueError:
        return False

def validate_file_upload(filename: str, allowed_extensions: list, max_size_mb: int = 10) -> dict:
    """Validate file upload"""
    result = {
        "is_valid": False,
        "errors": []
    }
    
    if not filename:
        result["errors"].append("Filename is required")
        return result
    
    # Check file extension
    file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
    if file_ext not in [ext.lower() for ext in allowed_extensions]:
        result["errors"].append(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
    
    # Check filename for unsafe characters
    if re.search(r'[<>:"/\\|?*]', filename):
        result["errors"].append("Filename contains unsafe characters")
    
    result["is_valid"] = len(result["errors"]) == 0
    return result

def validate_date_range(start_date: date, end_date: date) -> bool:
    """Validate that end date is after start date"""
    return end_date > start_date

def validate_future_date(target_date: date, min_days_ahead: int = 1) -> bool:
    """Validate that date is in the future"""
    today = date.today()
    return (target_date - today).days >= min_days_ahead

def validate_url(url: str) -> bool:
    """Validate URL format"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+'  # domain...
        r'(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # host...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return bool(url_pattern.match(url))

def validate_json_structure(data: dict, required_fields: list) -> dict:
    """Validate JSON data structure"""
    result = {
        "is_valid": True,
        "missing_fields": [],
        "errors": []
    }
    
    for field in required_fields:
        if field not in data:
            result["missing_fields"].append(field)
            result["is_valid"] = False
    
    if result["missing_fields"]:
        result["errors"].append(f"Missing required fields: {', '.join(result['missing_fields'])}")
    
    return result