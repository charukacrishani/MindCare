
from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import DoctorVPatient
from models.questionnaire import QuestionnaireResponse
from models.user import UserInformation, Users


router = APIRouter(prefix="/api/dashboard/doctor", tags=["Doctor Dashboard"])

@router.get("/appointments")
async def get_doctor_appointments():
    # Placeholder for fetching doctor's appointments
    return {"message": "List of doctor's appointments"}

@router.get("/patients")
async def get_doctor_patients(ctx: Context = Depends(get_context)):
    query = (
    select(
        DoctorVPatient.id,
        DoctorVPatient.patientid,
        DoctorVPatient.description,
        (Users.first_name + " " + Users.last_name).label("name"),
        UserInformation.age
    )
    .join(Users, DoctorVPatient.patientid == Users.userid)
    .join(UserInformation, Users.userid == UserInformation.userid, isouter=True)
)
    relationships = ctx.db.exec(query).all()
    if not relationships:
        return ctx.response.success(data=[])
    
    return ctx.response.success(data=ctx.serialize(relationships))
    

