# db.py
import os

from sqlmodel import SQLModel, Session, create_engine

# -------------------------
# DATABASE CONFIGURATION
# -------------------------
POSTGRES_USER = os.environ.get("POSTGRES_USER", "mindcare")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "password")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT", "5432")
POSTGRES_DB = os.environ.get("POSTGRES_DB", "mindcaredb")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@"
    f"{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# Create the SQLModel engine
engine = create_engine(DATABASE_URL, echo=True)

# -------------------------
# SESSION DEPENDENCY
# -------------------------
def get_session():
    """FastAPI dependency that provides a DB session per request."""
    with Session(engine) as session:
        yield session

# -------------------------
# TABLE CREATION UTILITY
# -------------------------
def init_db():
    from models import user, chats
    from models import password_reset  # ← add this
    SQLModel.metadata.create_all(engine)
    print("✅ All tables created successfully.")