from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class Chats(SQLModel, table=True):
    __tablename__ = "chats"

    chatid: Optional[str] = Field(default=None, primary_key=True)
    userid: str = Field(foreign_key="users.userid")
    date: datetime = Field(default_factory=datetime.utcnow)
    active: bool

class Messages(SQLModel, table=True):
    __tablename__ = "messages"

    messageid: Optional[str] = Field(default=None, primary_key=True)
    chatid: str = Field(foreign_key="chats.chatid")
    question: str
    answered: bool = Field(default=False)
    answer: str = Field(default='')
    date: datetime = Field(default_factory=datetime.utcnow)