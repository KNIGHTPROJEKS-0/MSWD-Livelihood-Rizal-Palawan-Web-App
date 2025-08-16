from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.firebase import ensure_firebase_initialized

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    
    # Initialize Firebase Admin SDK
    ensure_firebase_initialized()
    print("Firebase Admin SDK initialized")
    
    yield
    
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.ALLOWED_HOSTS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Root health endpoint for Railway
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MSWD Livelihood API is running"}

@app.get("/")
async def root():
    return {"message": "MSWD Livelihood Rizal Palawan API", "version": "1.0.0", "docs": "/docs"}