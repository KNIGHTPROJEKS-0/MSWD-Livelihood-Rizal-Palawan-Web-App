from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, programs, applications, admin, oauth

api_router = APIRouter()

# API v1 root endpoint
@api_router.get("/")
async def api_v1_root():
    return {
        "message": "MSWD Livelihood API v1",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "users": "/users", 
            "programs": "/programs",
            "applications": "/applications",
            "admin": "/admin",
            "oauth": "/oauth"
        }
    }

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])