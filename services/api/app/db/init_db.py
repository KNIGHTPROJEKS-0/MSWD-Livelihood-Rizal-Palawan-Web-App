from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.user import User, UserRole
from app.models.program import Program, ProgramStatus, ProgramCategory
from app.services.auth_service import auth_service
from app.core.config import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def create_superuser(db: Session) -> User:
    """Create initial superuser"""
    superuser_email = settings.FIRST_SUPERUSER_EMAIL
    superuser_password = settings.FIRST_SUPERUSER_PASSWORD
    
    # Check if superuser already exists
    user = db.query(User).filter(User.email == superuser_email).first()
    if user:
        logger.info(f"Superuser {superuser_email} already exists")
        return user
    
    # Create superuser
    user = User(
        email=superuser_email,
        name="System Administrator",
        hashed_password=auth_service.get_password_hash(superuser_password),
        role=UserRole.SUPERADMIN,
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow()
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"Superuser {superuser_email} created successfully")
    return user

def create_sample_programs(db: Session) -> None:
    """Create sample livelihood programs"""
    sample_programs = [
        {
            "title": "Sustainable Agriculture Training",
            "description": "Learn modern farming techniques, organic farming methods, and sustainable agriculture practices to improve crop yield and income.",
            "category": ProgramCategory.AGRICULTURE,
            "status": ProgramStatus.ACTIVE,
            "max_participants": 30,
            "start_date": datetime.utcnow() + timedelta(days=30),
            "end_date": datetime.utcnow() + timedelta(days=120),
            "location": "Rizal Agricultural Center",
            "requirements": "Basic farming experience, commitment to attend all sessions",
            "budget": "₱150,000"
        },
        {
            "title": "Food Processing and Preservation",
            "description": "Master food processing techniques, packaging, and preservation methods to start your own food business.",
            "category": ProgramCategory.FOOD_TECHNOLOGY,
            "status": ProgramStatus.ACTIVE,
            "max_participants": 25,
            "start_date": datetime.utcnow() + timedelta(days=45),
            "end_date": datetime.utcnow() + timedelta(days=105),
            "location": "MSWD Training Center",
            "requirements": "Interest in food business, basic cooking skills",
            "budget": "₱120,000"
        },
        {
            "title": "Handicrafts and Arts Training",
            "description": "Develop skills in traditional and modern handicrafts, including weaving, pottery, and decorative arts.",
            "category": ProgramCategory.HANDICRAFTS,
            "status": ProgramStatus.ACTIVE,
            "max_participants": 20,
            "start_date": datetime.utcnow() + timedelta(days=15),
            "end_date": datetime.utcnow() + timedelta(days=90),
            "location": "Community Arts Center",
            "requirements": "Creativity, patience, commitment to complete the program",
            "budget": "₱80,000"
        },
        {
            "title": "Small Business Management",
            "description": "Learn essential business skills including financial management, marketing, and customer service for small enterprises.",
            "category": ProgramCategory.BUSINESS,
            "status": ProgramStatus.ACTIVE,
            "max_participants": 35,
            "start_date": datetime.utcnow() + timedelta(days=20),
            "end_date": datetime.utcnow() + timedelta(days=80),
            "location": "MSWD Business Hub",
            "requirements": "Basic literacy, existing or planned business idea",
            "budget": "₱100,000"
        },
        {
            "title": "Digital Skills for Entrepreneurs",
            "description": "Master digital tools, social media marketing, and e-commerce platforms to grow your business online.",
            "category": ProgramCategory.TECHNOLOGY,
            "status": ProgramStatus.UPCOMING,
            "max_participants": 40,
            "start_date": datetime.utcnow() + timedelta(days=60),
            "end_date": datetime.utcnow() + timedelta(days=150),
            "location": "Digital Learning Center",
            "requirements": "Basic computer literacy, smartphone or computer access",
            "budget": "₱200,000"
        }
    ]
    
    for program_data in sample_programs:
        # Check if program already exists
        existing_program = db.query(Program).filter(Program.title == program_data["title"]).first()
        if existing_program:
            logger.info(f"Program '{program_data['title']}' already exists")
            continue
        
        program = Program(**program_data)
        db.add(program)
        logger.info(f"Created sample program: {program_data['title']}")
    
    db.commit()
    logger.info("Sample programs created successfully")

def create_sample_users(db: Session) -> None:
    """Create sample users for testing"""
    sample_users = [
        {
            "email": "admin@mswd-rizal.gov.ph",
            "name": "MSWD Administrator",
            "role": UserRole.ADMIN,
            "barangay": "Poblacion",
            "phone": "+639123456789"
        },
        {
            "email": "beneficiary1@example.com",
            "name": "Maria Santos",
            "role": UserRole.BENEFICIARY,
            "barangay": "Barangay 1",
            "phone": "+639987654321",
            "address": "123 Main Street, Rizal, Palawan",
            "occupation": "Farmer"
        },
        {
            "email": "beneficiary2@example.com",
            "name": "Juan Dela Cruz",
            "role": UserRole.BENEFICIARY,
            "barangay": "Barangay 2",
            "phone": "+639876543210",
            "address": "456 Secondary Road, Rizal, Palawan",
            "occupation": "Small Business Owner"
        }
    ]
    
    default_password = "password123"
    
    for user_data in sample_users:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            logger.info(f"User '{user_data['email']}' already exists")
            continue
        
        user = User(
            **user_data,
            hashed_password=auth_service.get_password_hash(default_password),
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow()
        )
        
        db.add(user)
        logger.info(f"Created sample user: {user_data['email']}")
    
    db.commit()
    logger.info("Sample users created successfully")

def init_db() -> None:
    """Initialize database with initial data"""
    logger.info("Initializing database...")
    
    # Create database tables
    from app.models import user, program, application, beneficiary, audit
    from app.core.database import Base
    
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Create initial data
    db = SessionLocal()
    try:
        # Create superuser
        create_superuser(db)
        
        # Create sample data only in development
        if settings.ENVIRONMENT == "development":
            create_sample_programs(db)
            create_sample_users(db)
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()