
from datetime import datetime, timedelta

from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import DoctorVPatient, Appointment
from models.questionnaire import QuestionnaireResponse
from models.user import UserInformation, Users


router = APIRouter(prefix="/api/dashboard/doctor", tags=["Doctor Dashboard"])

@router.get("/appointments")
async def get_doctor_appointments(date: str, ctx: Context = Depends(get_context)):
    start_date = datetime.strptime(date, "%Y-%m-%d")
    end_date = start_date + timedelta(days=1)

    query = (
        select(
            Appointment.id,
            Appointment.patient_id,
            (Users.first_name + " " + Users.last_name).label("name"),
            Appointment.status,
            Appointment.start_time,
        )
        .join(Users, Appointment.patient_id == Users.userid)
        .join(UserInformation, Users.userid == UserInformation.userid, isouter=True)
        .where(Appointment.doctor_id == ctx.user.user_id)
        .where(Appointment.start_time >= start_date)
        .where(Appointment.start_time < end_date)
    )

    relationships = ctx.db.exec(query).mappings().all()

    if not relationships:
        return ctx.response.success(data=[])

    return ctx.response.success(data=relationships)

@router.get("/patients")
async def get_doctor_patients(ctx: Context = Depends(get_context)):
    query = (
        select(
            DoctorVPatient.id,
            DoctorVPatient.patient_id,
            DoctorVPatient.description,
            (Users.first_name + " " + Users.last_name).label("name"),
            UserInformation.age
        )
        .join(Users, DoctorVPatient.patient_id == Users.userid)
        .join(UserInformation, Users.userid == UserInformation.userid, isouter=True)
        .where(DoctorVPatient.doctor_id == ctx.user.user_id)
    )

    relationships = ctx.db.exec(query).mappings().all()

    if not relationships:
        return ctx.response.success(data=[])

    return ctx.response.success(data=ctx.serialize(relationships))
    

