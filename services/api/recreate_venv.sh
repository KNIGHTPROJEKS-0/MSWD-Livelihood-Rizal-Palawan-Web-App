#!/bin/bash
set -e

echo "🔄 Recreating services/api virtual environment on Python 3.12.7"
echo "==============================================================="

# Change to services/api directory
cd "$(dirname "$0")"

# Check if Python 3.12.7 is available
if ! command -v python3.12 &> /dev/null; then
    echo "❌ Python 3.12 not found. Please install Python 3.12.7 via pyenv or system package manager."
    exit 1
fi

# Verify Python version
PYTHON_VERSION=$(python3.12 -c "import sys; print('.'.join(map(str, sys.version_info[:3])))")
echo "✅ Using Python: $PYTHON_VERSION"

# Remove existing virtual environment
if [ -d "venv" ]; then
    echo "🗑️  Removing existing virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
echo "📦 Creating new virtual environment..."
python3.12 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip, setuptools, and wheel
echo "⬆️  Upgrading pip, setuptools, and wheel..."
python -m pip install --upgrade pip setuptools wheel

# Install dependencies
echo "📥 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Report installation summary
echo ""
echo "🎉 Installation completed successfully!"
echo "==============================================="

# Show Python and pip versions
echo ""
echo "🐍 Python version: $(python -V)"
echo "📦 Pip version: $(pip -V)"

# Smoke test critical imports
echo ""
echo "🧪 Running import smoke tests..."
echo "================================="

python -c "
import sys
print(f'Python executable: {sys.executable}')
print(f'Python version: {sys.version}')
print()

test_packages = [
    ('fastapi', 'FastAPI'),
    ('pydantic', 'Pydantic'),
    ('sqlalchemy', 'SQLAlchemy'),
    ('uvicorn', 'Uvicorn'),
    ('numpy', 'NumPy'),
    ('pandas', 'Pandas'),
    ('PIL', 'Pillow'),
    ('redis', 'Redis'),
    ('firebase_admin', 'Firebase Admin'),
    ('celery', 'Celery'),
    ('jose', 'Python JOSE'),
    ('passlib', 'Passlib'),
    ('alembic', 'Alembic'),
    ('psycopg2', 'Psycopg2'),
    ('httpx', 'HTTPX'),
    ('pytest', 'Pytest'),
    ('svix', 'Svix')
]

success_count = 0
total_count = len(test_packages)

for module_name, display_name in test_packages:
    try:
        if module_name == 'PIL':
            import PIL
            print(f'✅ {display_name}: {PIL.__version__}')
        else:
            module = __import__(module_name)
            version = getattr(module, '__version__', 'unknown')
            print(f'✅ {display_name}: {version}')
        success_count += 1
    except ImportError as e:
        print(f'❌ {display_name}: Import failed - {e}')
    except Exception as e:
        print(f'⚠️  {display_name}: Version check failed - {e}')
        success_count += 1  # Still count as success if import worked

print()
print(f'🎯 Import test results: {success_count}/{total_count} packages successfully imported')

if success_count == total_count:
    print('🎉 All critical packages imported successfully!')
    exit_code = 0
else:
    print('⚠️  Some packages failed to import. Check the output above.')
    exit_code = 1

sys.exit(exit_code)
"

IMPORT_EXIT_CODE=$?

echo ""
if [ $IMPORT_EXIT_CODE -eq 0 ]; then
    echo "✅ Virtual environment recreated and tested successfully!"
    echo "🚀 You can now activate it with: source venv/bin/activate"
else
    echo "⚠️  Virtual environment was created but some imports failed."
    echo "   Please check the error messages above."
fi

echo ""
echo "📍 Virtual environment location: $(pwd)/venv"
echo "🐍 Python executable: $(pwd)/venv/bin/python"
echo "📦 Pip executable: $(pwd)/venv/bin/pip"