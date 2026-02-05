from sqlmodel import SQLModel, Field
from datetime import datetime


class Users(SQLModel, table=True):
    __tablename__ = "users"

    userid: str = Field(primary_key=True)
    email: str = Field(unique=True)
    password: str
    role: str
    isVerified: bool = Field(default=False)
    isComplete: bool = Field(default=False)
    
    
class UserInformation(SQLModel, table=True):
    __tablename__ = "user_information"

    userid: str = Field(primary_key=True, foreign_key="users.userid")
    first_name: str
    last_name: str
    dob: datetime
    occupation: str
    gender: str
    
class DoctorInformation(SQLModel, table=True):
    __tablename__ = "doctor_information"
    
    userid: str = Field(primary_key=True, foreign_key="users.userid")
    first_name: str
    last_name: str
    license_no: str
    location: str
    specialization: str
    hospital: str