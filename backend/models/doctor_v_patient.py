from sqlmodel import SQLModel, Field
from datetime import datetime, time
from typing import Optional


class DoctorVPatient(SQLModel, table=True):
    __tablename__ = "doctor_v_patient"
    
    id: int = Field(default=None, primary_key=True)
    patient_id: str = Field(primary_key=True, foreign_key="users.userid")
    doctor_id: str = Field(primary_key=True, foreign_key="users.userid")
    allowChatAccess: bool = Field(default=False)
    description: str = Field(default="")    


class DoctorAvailability(SQLModel, table=True):
    __tablename__ = "doctor_availability"

    id: Optional[int] = Field(default=None, primary_key=True)

    doctor_id: str = Field(foreign_key="users.userid", index=True)

    day_of_week: int  # 0=Monday ... 6=Sunday
    start_time: time
    end_time: time

    slot_duration_minutes: int = 30

    is_active: bool = True
    
    
class DoctorTimeOff(SQLModel, table=True):
    __tablename__ = "doctor_time_off"

    id: Optional[int] = Field(default=None, primary_key=True)

    doctor_id: str = Field(foreign_key="users.userid", index=True)

    start_datetime: datetime
    end_datetime: datetime

    reason: Optional[str] = None
    
    
class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: Optional[int] = Field(default=None, primary_key=True)

    doctor_id: str = Field(foreign_key="users.userid", index=True)
    patient_id: str = Field(foreign_key="users.userid", index=True)

    start_time: datetime = Field(index=True)
    end_time: datetime

    status: str = Field(default="scheduled")
    # scheduled | completed | cancelled | no_show

    reason: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    

class AppointmentPayment(SQLModel, table=True):
    __tablename__ = "appointment_payments"

    id: Optional[int] = Field(default=None, primary_key=True)

    appointment_id: int = Field(foreign_key="appointments.id")

    amount: float
    status: str = Field(default="pending")
    # pending | paid | failed

    paid_at: Optional[datetime] = None
    
class DoctorReview(SQLModel, table=True):
    __tablename__ = "doctor_reviews"

    id: Optional[int] = Field(default=None, primary_key=True)

    doctor_id: str = Field(foreign_key="users.userid")
    patient_id: str = Field(foreign_key="users.userid")

    rating: int  # 1–5
    comment: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)