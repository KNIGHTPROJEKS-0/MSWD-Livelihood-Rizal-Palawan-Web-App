#!/usr/bin/env python3
"""
Database migration script to create schema in Neon PostgreSQL database.
Run this script to push the database schema to the Neon database.
"""

import os
import sys

# Add services/api to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'services', 'api'))

# Set the DATABASE_URL environment variable to Neon
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_Ig6bZwDe9JUM@ep-morning-shape-aqxfcvv6-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

from app.core.database import engine, Base
from app.models.user import User
from app.models.program import Program
from app.models.application import Application
from app.models.beneficiary import Beneficiary
from app.models.case_form import CaseForm
from app.models.form_document import FormDocument
from app.models.livelihood_update import LivelihoodUpdate
from app.models.message import Message
from app.models.audit import AuditLog

def migrate():
    """Create all tables in the Neon database."""
    print("Connecting to Neon database...")
    print(f"DATABASE_URL: {os.environ['DATABASE_URL'][:50]}...")
    
    try:
        print("Creating database schema...")
        Base.metadata.create_all(bind=engine)
        print("✅ Schema migration completed successfully!")
        print("\nTables created:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
