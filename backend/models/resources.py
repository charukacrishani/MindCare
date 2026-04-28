from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Resources(SQLModel, table=True):
    __tablename__ = "studyhub_resources"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    author: Optional[str] = None