---
name: SQLAlchemy create_all model import ordering
description: All SQLAlchemy model classes must be imported before calling Base.metadata.create_all or the tables will not be registered and won't be created.
---

## Rule
In FastAPI + SQLAlchemy projects, always explicitly import every model module before calling `Base.metadata.create_all(bind=engine)`.

**Why:** SQLAlchemy's `Base.metadata` only knows about models that have been imported (and thus subclassed `Base`) at the time `create_all` is called. If models are lazily imported inside router function bodies, the metadata will be empty and no tables will be created — causing "relation does not exist" errors even though the code looks correct.

**How to apply:** In `main.py`, add explicit imports of every model at the top, before the `create_all` call:
```python
from app.models.user import User
from app.models.program import Program
# ... all other models ...
Base.metadata.create_all(bind=engine)
```
