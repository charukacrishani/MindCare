from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class PasswordReset(SQLModel, table=True):
    __tablename__ = "password_resets"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    code: str
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)