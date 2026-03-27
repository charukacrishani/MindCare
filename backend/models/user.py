from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Users(SQLModel, table=True):
    __tablename__ = "users"

    userid: str = Field(primary_key=True)
    username: str = Field(unique=True)
    email: str = Field(unique=True)
    password: str
    role: str                              # "user" | "counselor"
    first_name: str
    last_name: str
    isVerified: bool = Field(default=False)
    isComplete: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserInformation(SQLModel, table=True):
    __tablename__ = "user_information"

    userid: str = Field(primary_key=True, foreign_key="users.userid")
    dob: Optional[datetime] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    gender: Optional[str] = None
    sexual_orientation: Optional[str] = None
    marital_status: Optional[str] = None


class DoctorInformation(SQLModel, table=True):
    __tablename__ = "doctor_information"

    userid: str = Field(primary_key=True, foreign_key="users.userid")
    full_name: Optional[str] = None
    dob: Optional[datetime] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    license_no: Optional[str] = None
    licence_number: Optional[str] = None
    years_of_experience: Optional[int] = None
    specializations: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    hospital: Optional[str] = None