# db.py
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///mydb.db"
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