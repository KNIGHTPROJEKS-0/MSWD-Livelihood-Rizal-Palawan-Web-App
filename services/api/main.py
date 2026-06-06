import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.makedirs("uploads", exist_ok=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal

# Import ALL models before create_all so they are registered with Base.metadata
from app.models.user import User
from app.models.program import Program
from app.models.application import Application
from app.models.case_form import CaseForm
from app.models.form_document import FormDocument
from app.models.livelihood_update import LivelihoodUpdate
from app.models.message import Message

from app.routers import auth, users, programs, applications, admin
from app.routers import forms, livelihood_updates, messages

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(programs.router, prefix=f"{settings.API_V1_STR}/programs", tags=["programs"])
app.include_router(applications.router, prefix=f"{settings.API_V1_STR}/applications", tags=["applications"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(forms.router, prefix=f"{settings.API_V1_STR}/forms", tags=["forms"])
app.include_router(livelihood_updates.router, prefix=f"{settings.API_V1_STR}/livelihood-updates", tags=["livelihood-updates"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "MSWD Livelihood API is running"}


@app.get("/")
def root():
    return {"message": "MSWD Livelihood Rizal Palawan API", "version": "1.0.0"}


def seed_superuser():
    from app.models.user import User
    from app.core.security import get_password_hash
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
        if not existing:
            superuser = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                first_name="System",
                last_name="Administrator",
                role="superadmin",
                is_active=True,
                is_verified=True,
            )
            db.add(superuser)
            db.commit()
            print(f"Superuser created: {settings.FIRST_SUPERUSER_EMAIL}")
    except Exception as e:
        print(f"Seed error: {e}")
        db.rollback()
    finally:
        db.close()


def seed_programs():
    from app.models.program import Program
    from app.models.user import User
    db = SessionLocal()
    try:
        count = db.query(Program).count()
        if count == 0:
            admin_user = db.query(User).filter(User.role == "superadmin").first()
            admin_id = admin_user.id if admin_user else None
            programs = [
                Program(title="Livelihood Assistance Program", description="Financial and skills support for community members seeking to start or grow their livelihood. Covers seed capital, tools, and training.", category="Financial Assistance", status="active", max_participants=50, current_participants=12, location="Municipal Hall, Rizal, Palawan", requirements="Barangay Certificate of Indigency, Valid ID, Social Case Study Report", budget="PHP 500,000", created_by=admin_id),
                Program(title="Magtitinda Program (Sari-sari Store)", description="Support program for aspiring sari-sari store owners. Includes start-up capital and business management training.", category="Enterprise Development", status="active", max_participants=30, current_participants=8, location="Barangay Hall, Rizal, Palawan", requirements="Barangay Certificate, Medical Certificate, Valid ID", budget="PHP 200,000", created_by=admin_id),
                Program(title="Kabuhayan sa Pagsasaka (Farming)", description="Agricultural livelihood support including seeds, tools, and farming techniques training for farmers in Rizal, Palawan.", category="Agriculture", status="active", max_participants=40, current_participants=15, location="Municipal Agriculture Office, Rizal", requirements="Proof of land use, Valid ID, Barangay Certificate", budget="PHP 350,000", created_by=admin_id),
                Program(title="Pangisdaan (Fishing) Support Program", description="Fishing livelihood assistance including equipment, boat repair subsidy, and marketing linkage support.", category="Fishing / Aquaculture", status="active", max_participants=25, current_participants=7, location="Coastal Barangays, Rizal, Palawan", requirements="Fisher ID or Barangay Certification, Valid ID", budget="PHP 180,000", created_by=admin_id),
                Program(title="Skills Training – Handicraft & Weaving", description="Skills development program for traditional weaving, handicraft making, and product marketing for women beneficiaries.", category="Skills Training", status="active", max_participants=20, current_participants=4, location="MSWD Office, Rizal, Palawan", requirements="Barangay Certificate, Valid ID, willingness to attend full training", budget="PHP 120,000", created_by=admin_id),
                Program(title="Pondo sa Pagbabago at Pag-asenso (3P)", description="Microfinance assistance program providing small loans and financial literacy training to marginalized beneficiaries.", category="Microfinance", status="active", max_participants=60, current_participants=22, location="MSWD Office, Rizal, Palawan", requirements="Barangay Certificate of Indigency, Valid ID, No existing formal bank loan", budget="PHP 600,000", created_by=admin_id),
            ]
            for p in programs:
                db.add(p)
            db.commit()
            print("Sample programs seeded.")
    except Exception as e:
        print(f"Program seed error: {e}")
        db.rollback()
    finally:
        db.close()


seed_superuser()
seed_programs()
