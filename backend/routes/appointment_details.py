from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import Appointment
from models.user import DoctorInformation, Users
from routes.avatar.avatar_routes import get_avatar


router = APIRouter(prefix="/api/appointments", tags=["Appointment Details"])


@router.get("/{appointment_id}")
def get_appointment_details(
    appointment_id: int,
    ctx: Context = Depends(get_context),
):
    """
    Get a single appointment by id with doctor and patient metadata.
    Access is restricted to the appointment's patient or doctor.
    """
    appointment = ctx.db.exec(
        select(Appointment).where(Appointment.id == appointment_id)
    ).first()

    if not appointment:
        return ctx.response.error(message="Appointment not found")

    current_user_id = ctx.user.user_id
    if current_user_id not in {appointment.patient_id, appointment.doctor_id}:
        return ctx.response.error(message="Unauthorized")

    doctor_profile = ctx.db.exec(
        select(DoctorInformation).where(DoctorInformation.userid == appointment.doctor_id)
    ).first()
    doctor_user = ctx.db.exec(
        select(Users).where(Users.userid == appointment.doctor_id)
    ).first()
    patient_user = ctx.db.exec(
        select(Users).where(Users.userid == appointment.patient_id)
    ).first()

    if doctor_profile and doctor_profile.full_name:
        doctor_name = doctor_profile.full_name
    elif doctor_user:
        doctor_name = f"{doctor_user.first_name} {doctor_user.last_name}".strip()
    else:
        doctor_name = "Unknown Doctor"

    if patient_user:
        patient_name = f"{patient_user.first_name} {patient_user.last_name}".strip()
    else:
        patient_name = "Unknown Patient"

    data = ctx.serialize(appointment)
    data["doctor_name"] = doctor_name
    data["patient_name"] = patient_name
    data["doctor_avatar"] = get_avatar(appointment.doctor_id, ctx)
    data["patient_avatar"] = get_avatar(appointment.patient_id, ctx)

    return ctx.response.success(message="Appointment retrieved", data=data)
