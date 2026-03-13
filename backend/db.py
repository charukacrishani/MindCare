# db.py
from sqlmodel import SQLModel, Session, create_engine

# -------------------------
# DATABASE CONFIGURATION
# -------------------------
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "password"
POSTGRES_HOST = "localhost"
POSTGRES_PORT = "5432"
POSTGRES_DB = "mindcare"

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
    """Call this once to create all tables in the database."""
    from models import user, chats
    SQLModel.metadata.create_all(engine)
    print("✅ All tables created successfully.")