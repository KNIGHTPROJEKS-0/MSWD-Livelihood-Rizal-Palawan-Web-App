from datetime import datetime, date
from typing import Optional, Union
import re
from decimal import Decimal

def format_currency(amount: Union[int, float, Decimal], currency: str = "PHP", include_symbol: bool = True) -> str:
    """Format currency amount with proper formatting"""
    if amount is None:
        return "0.00"
    
    # Convert to float for formatting
    amount_float = float(amount)
    
    # Format with commas and 2 decimal places
    formatted = f"{amount_float:,.2f}"
    
    if include_symbol:
        if currency.upper() == "PHP":
            return f"₱{formatted}"
        elif currency.upper() == "USD":
            return f"${formatted}"
        else:
            return f"{currency} {formatted}"
    
    return formatted

def format_date(date_obj: Union[datetime, date, str], format_type: str = "default") -> str:
    """Format date with various format options"""
    if not date_obj:
        return ""
    
    # Convert string to datetime if needed
    if isinstance(date_obj, str):
        try:
            date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        except ValueError:
            return date_obj  # Return original if can't parse
    
    # Convert datetime to date if needed for date-only formats
    if isinstance(date_obj, datetime) and format_type in ["short", "medium", "long"]:
        date_obj = date_obj.date()
    
    format_patterns = {
        "default": "%Y-%m-%d",
        "short": "%m/%d/%Y",
        "medium": "%b %d, %Y",
        "long": "%B %d, %Y",
        "full": "%A, %B %d, %Y",
        "datetime": "%Y-%m-%d %H:%M:%S",
        "datetime_short": "%m/%d/%Y %I:%M %p",
        "time_only": "%H:%M:%S",
        "time_12h": "%I:%M %p",
        "iso": "%Y-%m-%dT%H:%M:%S",
        "filipino": "%B %d, %Y",  # Month Day, Year format common in Philippines
        "filipino_short": "%m-%d-%Y"  # MM-DD-YYYY format
    }
    
    pattern = format_patterns.get(format_type, format_patterns["default"])
    
    try:
        return date_obj.strftime(pattern)
    except AttributeError:
        return str(date_obj)

def format_name(first_name: str, last_name: str, middle_name: Optional[str] = None, format_type: str = "full") -> str:
    """Format person's name in various formats"""
    if not first_name and not last_name:
        return ""
    
    # Clean and capitalize names
    first = first_name.strip().title() if first_name else ""
    last = last_name.strip().title() if last_name else ""
    middle = middle_name.strip().title() if middle_name else ""
    
    if format_type == "full":
        if middle:
            return f"{first} {middle} {last}".strip()
        return f"{first} {last}".strip()
    
    elif format_type == "last_first":
        if middle:
            return f"{last}, {first} {middle}".strip()
        return f"{last}, {first}".strip()
    
    elif format_type == "initials":
        initials = ""
        if first:
            initials += first[0].upper()
        if middle:
            initials += middle[0].upper()
        if last:
            initials += last[0].upper()
        return initials
    
    elif format_type == "first_last":
        return f"{first} {last}".strip()
    
    elif format_type == "first_only":
        return first
    
    elif format_type == "last_only":
        return last
    
    elif format_type == "formal":
        # Format: Last, First M.
        middle_initial = f" {middle[0]}." if middle else ""
        return f"{last}, {first}{middle_initial}".strip()
    
    return f"{first} {last}".strip()

def format_phone(phone: str, format_type: str = "local") -> str:
    """Format Philippine phone number"""
    if not phone:
        return ""
    
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Handle different input formats
    if digits.startswith('639'):
        # International format: +639XXXXXXXXX
        local_digits = '0' + digits[2:]
    elif digits.startswith('9') and len(digits) == 10:
        # Format: 9XXXXXXXXX
        local_digits = '0' + digits
    elif digits.startswith('09'):
        # Local format: 09XXXXXXXXX
        local_digits = digits
    else:
        return phone  # Return original if format not recognized
    
    if len(local_digits) != 11:
        return phone  # Return original if length is incorrect
    
    if format_type == "local":
        # Format: 09XX-XXX-XXXX
        return f"{local_digits[:4]}-{local_digits[4:7]}-{local_digits[7:]}"
    
    elif format_type == "international":
        # Format: +63 9XX XXX XXXX
        return f"+63 {local_digits[1:4]} {local_digits[4:7]} {local_digits[7:]}"
    
    elif format_type == "dots":
        # Format: 09XX.XXX.XXXX
        return f"{local_digits[:4]}.{local_digits[4:7]}.{local_digits[7:]}"
    
    elif format_type == "spaces":
        # Format: 09XX XXX XXXX
        return f"{local_digits[:4]} {local_digits[4:7]} {local_digits[7:]}"
    
    elif format_type == "plain":
        # Format: 09XXXXXXXXX (no formatting)
        return local_digits
    
    return local_digits

def format_address(address_parts: dict) -> str:
    """Format complete address from parts"""
    parts = []
    
    # House/Unit number and street
    if address_parts.get('house_number'):
        parts.append(address_parts['house_number'])
    
    if address_parts.get('street'):
        parts.append(address_parts['street'])
    
    # Barangay
    if address_parts.get('barangay'):
        parts.append(f"Brgy. {address_parts['barangay']}")
    
    # Municipality/City
    if address_parts.get('municipality'):
        parts.append(address_parts['municipality'])
    
    # Province
    if address_parts.get('province'):
        parts.append(address_parts['province'])
    
    # Postal code
    if address_parts.get('postal_code'):
        parts.append(address_parts['postal_code'])
    
    return ', '.join(parts)

def format_percentage(value: Union[int, float], decimal_places: int = 1) -> str:
    """Format percentage value"""
    if value is None:
        return "0%"
    
    return f"{value:.{decimal_places}f}%"

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    size = float(size_bytes)
    
    while size >= 1024.0 and i < len(size_names) - 1:
        size /= 1024.0
        i += 1
    
    return f"{size:.1f} {size_names[i]}"

def format_duration(seconds: int) -> str:
    """Format duration in human readable format"""
    if seconds < 60:
        return f"{seconds} seconds"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        if remaining_seconds == 0:
            return f"{minutes} minutes"
        return f"{minutes} minutes {remaining_seconds} seconds"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        if remaining_minutes == 0:
            return f"{hours} hours"
        return f"{hours} hours {remaining_minutes} minutes"

def format_program_code(program_name: str, year: int, sequence: int) -> str:
    """Generate formatted program code"""
    # Extract initials from program name
    words = program_name.upper().split()
    initials = ''.join([word[0] for word in words if word])
    
    # Limit to 4 characters
    if len(initials) > 4:
        initials = initials[:4]
    
    return f"{initials}-{year}-{sequence:03d}"

def format_reference_number(prefix: str, year: int, month: int, sequence: int) -> str:
    """Generate formatted reference number"""
    return f"{prefix.upper()}-{year}{month:02d}-{sequence:06d}"

def format_tin(tin: str) -> str:
    """Format TIN number"""
    if not tin:
        return ""
    
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', tin)
    
    if len(digits) == 9:
        # Format: XXX-XXX-XXX
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    elif len(digits) == 12:
        # Format: XXX-XXX-XXX-XXX
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]}-{digits[9:]}"
    
    return tin  # Return original if format not recognized

def format_id_number(id_number: str, id_type: str) -> str:
    """Format various ID numbers"""
    if not id_number:
        return ""
    
    digits = re.sub(r'\D', '', id_number)
    
    if id_type.upper() == "SSS":
        # Format: XX-XXXXXXX-X
        if len(digits) == 10:
            return f"{digits[:2]}-{digits[2:9]}-{digits[9]}"
    
    elif id_type.upper() == "PHILHEALTH":
        # Format: XX-XXXXXXXXX-X
        if len(digits) == 12:
            return f"{digits[:2]}-{digits[2:11]}-{digits[11]}"
    
    elif id_type.upper() == "PAGIBIG":
        # Format: XXXX-XXXX-XXXX
        if len(digits) == 12:
            return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"
    
    return id_number  # Return original if format not recognized

def format_status(status: str) -> str:
    """Format status text for display"""
    if not status:
        return ""
    
    # Replace underscores with spaces and title case
    formatted = status.replace('_', ' ').title()
    
    # Handle special cases
    status_mappings = {
        'In Progress': 'In Progress',
        'In Review': 'In Review',
        'On Hold': 'On Hold',
        'Not Started': 'Not Started',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled',
        'Approved': 'Approved',
        'Rejected': 'Rejected',
        'Pending': 'Pending',
        'Active': 'Active',
        'Inactive': 'Inactive'
    }
    
    return status_mappings.get(formatted, formatted)

def format_list_display(items: list, max_items: int = 3, separator: str = ", ") -> str:
    """Format list for display with truncation"""
    if not items:
        return ""
    
    if len(items) <= max_items:
        return separator.join(str(item) for item in items)
    
    displayed_items = items[:max_items]
    remaining_count = len(items) - max_items
    
    displayed = separator.join(str(item) for item in displayed_items)
    return f"{displayed} and {remaining_count} more"

def format_search_highlight(text: str, search_term: str, highlight_class: str = "highlight") -> str:
    """Format text with search term highlighting"""
    if not search_term or not text:
        return text
    
    # Escape special regex characters in search term
    escaped_term = re.escape(search_term)
    
    # Case-insensitive replacement
    pattern = re.compile(escaped_term, re.IGNORECASE)
    
    def replace_func(match):
        return f'<span class="{highlight_class}">{match.group()}</span>'
    
    return pattern.sub(replace_func, text)