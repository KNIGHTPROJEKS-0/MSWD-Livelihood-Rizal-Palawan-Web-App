import os
import sys

# Add the services/api directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'services', 'api'))

from mangum import Mangum
from app.main import app

# Create the ASGI handler for Vercel
handler = Mangum(app, lifespan="off")
