import base64
import json
import os
from pathlib import Path
from typing import Optional, Union

import firebase_admin
from firebase_admin import credentials, App

try:
    # settings might not have Firebase keys defined; we handle fallbacks
    from app.core.config import settings  # type: ignore
except Exception:
    settings = None  # Fallback to environment variables


_firebase_app: Optional[App] = None


def _env(name: str) -> Optional[str]:
    """Get an environment value from settings if present, otherwise from os.environ."""
    if settings is not None and hasattr(settings, name):
        return getattr(settings, name)  # type: ignore[attr-defined]
    return os.getenv(name)


def _load_credentials() -> credentials.Base:
    """
    Load Firebase credentials supporting multiple patterns:
    1) GOOGLE_APPLICATION_CREDENTIALS -> absolute path to JSON file
    2) FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 ->
       - if value is a path to file -> load file
       - if value looks like base64 -> decode to JSON dict
       - if value looks like JSON -> parse directly
    """
    # 1) Standard Google env path
    gac_path = _env("GOOGLE_APPLICATION_CREDENTIALS")
    if gac_path:
        p = Path(gac_path).expanduser().resolve()
        if p.exists():
            return credentials.Certificate(str(p))

    # 2) Flexible service account env
    svc_value = _env("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64")
    if svc_value:
        # If it’s a file path
        possible_path = Path(svc_value).expanduser()
        try:
            possible_path = possible_path.resolve()
        except Exception:
            # If resolve fails, continue with other strategies
            possible_path = Path(str(possible_path))

        if possible_path.exists():
            return credentials.Certificate(str(possible_path))

        # If it starts with "{" assume raw JSON
        if svc_value.strip().startswith("{"):
            try:
                data = json.loads(svc_value)
                return credentials.Certificate(data)
            except Exception as e:
                raise RuntimeError(f"Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: {e}")

        # Otherwise, try base64 decode -> JSON
        try:
            decoded = base64.b64decode(svc_value).decode("utf-8")
            data = json.loads(decoded)
            return credentials.Certificate(data)
        except Exception:
            # Fall through to error below
            pass

    # If none of the above worked, give a helpful error
    raise RuntimeError(
        "Firebase credentials not provided or invalid. "
        "Set GOOGLE_APPLICATION_CREDENTIALS to a JSON file path, or "
        "set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 to either a base64-encoded JSON, "
        "raw JSON, or a file path."
    )


def ensure_firebase_initialized() -> App:
    """
    Initialize and return the global Firebase Admin app instance.
    Safe to call multiple times.
    """
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    # If already initialized elsewhere, reuse it
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        # Not initialized yet
        pass

    cred = _load_credentials()

    # Try to pass projectId if available (optional)
    project_id = _env("FIREBASE_PROJECT_ID")

    options = {}
    if project_id:
        options["projectId"] = project_id

    _firebase_app = firebase_admin.initialize_app(cred, options or None)
    return _firebase_app


def get_firebase_app() -> App:
    """Get the initialized Firebase app, initializing on first use."""
    return ensure_firebase_initialized()