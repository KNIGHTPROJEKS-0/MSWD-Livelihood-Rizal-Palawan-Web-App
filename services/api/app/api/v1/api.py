from fastapi import APIRouter
from .endpoints import auth, users, programs, applications, beneficiaries, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(beneficiaries.router, prefix="/beneficiaries", tags=["beneficiaries"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])