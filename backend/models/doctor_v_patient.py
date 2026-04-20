

from sqlmodel import Field, SQLModel


class DoctorVPatient(SQLModel, table=True):
    __tablename__ = "doctor_v_patient"
    
    id: int = Field(default=None, primary_key=True)
    patientid: str = Field(primary_key=True, foreign_key="users.userid")
    doctorid: str = Field(primary_key=True, foreign_key="users.userid")
    description: str = Field(default="")
    
    
