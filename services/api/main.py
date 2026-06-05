import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.routers import auth, users, programs, applications, admin

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


seed_superuser()
