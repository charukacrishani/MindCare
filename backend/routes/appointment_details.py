from fastapi import APIRouter, Body, Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import Appointment, DoctorReview, DoctorVPatient
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
    doctorVPatient = ctx.db.exec(
        select(DoctorVPatient).where(DoctorVPatient.patient_id == appointment.patient_id, DoctorVPatient.doctor_id == appointment.doctor_id)
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
    data["patient_notes"] = doctorVPatient.description if doctorVPatient else None

    return ctx.response.success(message="Appointment retrieved", data=data)


@router.patch("/{appointment_id}/counselor")
def update_appointment_for_counselor(
    appointment_id: int,
    payload: dict = Body(...),
    ctx: Context = Depends(get_context),
):
    """
    Allow the appointment counselor to update appointment status and counselor notes.
    """
    appointment = ctx.db.exec(
        select(Appointment).where(Appointment.id == appointment_id)
    ).first()

    if not appointment:
        return ctx.response.error(message="Appointment not found")

    if ctx.user.user_id != appointment.doctor_id:
        return ctx.response.error(message="Unauthorized")

    allowed_statuses = {"scheduled", "in_progress", "completed", "cancelled", "no_show"}
    valid_transitions = {
        "scheduled": {"scheduled", "in_progress", "completed", "cancelled", "no_show"},
        "in_progress": {"in_progress", "completed", "no_show"},
        "completed": {"completed"},
        "cancelled": {"cancelled"},
        "no_show": {"no_show"},
    }

    if "status" in payload:
        new_status = str(payload.get("status") or "").strip()
        if new_status not in allowed_statuses:
            return ctx.response.error(message="Invalid appointment status")

        current_status = str(appointment.status or "scheduled")
        allowed_next_states = valid_transitions.get(current_status, {current_status})
        if new_status not in allowed_next_states:
            return ctx.response.error(
                message=f"Invalid status transition from {current_status} to {new_status}"
            )

        appointment.status = new_status

    if "doctor_notes" in payload:
        raw_notes = payload.get("doctor_notes")
        cleaned_notes = str(raw_notes or "").strip()
        appointment.doctor_notes = cleaned_notes if cleaned_notes else None
    
    if "patient_notes" in payload:
        raw_notes = payload.get("patient_notes")
        cleaned_notes = str(raw_notes or "").strip()
        doctorVpatient = ctx.db.exec(
            select(DoctorVPatient).where(DoctorVPatient.patient_id == appointment.patient_id, DoctorVPatient.doctor_id == appointment.doctor_id)
        ).first()
        if doctorVpatient is None:
            return ctx.response.error(message="Doctor-patient relationship not found")
        doctorVpatient.description = cleaned_notes if cleaned_notes else None
        ctx.db.add(doctorVpatient)

    ctx.db.add(appointment)
    ctx.db.commit()
    ctx.db.refresh(appointment)

    return ctx.response.success(
        message="Appointment updated successfully",
        data=ctx.serialize(appointment),
    )


@router.post("/{appointment_id}/rate")
def rate_appointment(
    appointment_id: str,
    payload: dict = Body(...),
    ctx: Context = Depends(get_context),
):
    appointment = ctx.db.exec(
        select(Appointment).where(Appointment.id == appointment_id)
    ).first()

    if not appointment:
        return ctx.response.error(message="Appointment not found")
    
    if ctx.user.user_id != appointment.patient_id:
        return ctx.response.error(message="Unauthorized")
    
    if appointment.status != "completed":
        return ctx.response.error(message="Cannot rate this appointment")
    
    rate_query = ctx.db.exec(
        select(DoctorReview).where(DoctorReview.appointment_id == appointment_id)
    ).first()
    
    if rate_query:
        return ctx.response.error(message="Appointment already rated")

    if "rating" not in payload:
        return ctx.response.error(message="Rating is required")

    raw_rating = payload.get("rating")
    try:
        rating_value = int(raw_rating)
    except (TypeError, ValueError):
        return ctx.response.error(message="Rating must be an integer between 1 and 5")

    if rating_value < 1 or rating_value > 5:
        return ctx.response.error(message="Rating must be between 1 and 5")

    raw_comment = payload.get("comment")
    cleaned_comment = None
    if raw_comment is not None:
        cleaned_value = str(raw_comment).strip()
        cleaned_comment = cleaned_value if cleaned_value else None

    review = DoctorReview(
        doctor_id=appointment.doctor_id,
        patient_id=appointment.patient_id,
        appointment_id=appointment.id,
        rating=rating_value,
        comment=cleaned_comment,
    )

    ctx.db.add(review)
    ctx.db.commit()
    ctx.db.refresh(review)

    return ctx.response.success(
        message="Doctor review submitted successfully",
        data=ctx.serialize(review),
    )
    
    
@router.get("/{appointment_id}/rate")
def get_appointment_rating(
    appointment_id: str,
    ctx: Context = Depends(get_context),
):
    appointment = ctx.db.exec(
        select(Appointment).where(Appointment.id == appointment_id)
    ).first()

    if not appointment:
        return ctx.response.error(message="Appointment not found")
    
    if ctx.user.user_id not in {appointment.patient_id, appointment.doctor_id}:
        return ctx.response.error(message="Unauthorized")
    
    review = ctx.db.exec(
        select(DoctorReview).where(DoctorReview.appointment_id == appointment_id)
    ).first()

    if not review:
        return ctx.response.error(message="No review found for this appointment")

    return ctx.response.success(
        message="Doctor review retrieved successfully",
        data=ctx.serialize(review),
    )