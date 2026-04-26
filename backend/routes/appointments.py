import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from datetime import datetime, timedelta
from context import Context, get_context
from models.doctor_v_patient import (
    DoctorAvailability,
    DoctorTimeOff,
    Appointment,
    AppointmentPayment,
    DoctorVPatient,
)
from models.user import DoctorInformation
from routes.avatar.avatar_routes import get_avatar
from models.user import Users
from routes.user.user import get_user, get_user_by_id
from utils.create_meet import create_meet_link
from utils.send_email import send_email


router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("/doctor/{doctor_id}/availability")
def get_doctor_availability(
    doctor_id: str,
    ctx: Context = Depends(get_context),
):
    """
    Get doctor's availability schedule (weekly availability).
    """
    try:
        query = select(DoctorAvailability).where(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.is_active == True,
        )
        
        availability = ctx.db.exec(query).all()
        
        if not availability:
            return ctx.response.error(
                message="Doctor has no availability set",
            )
        
        data = [ctx.serialize(a) for a in availability]
        return ctx.response.success(message="Availability retrieved", data=data)
    except Exception as e:
        print(f"Error fetching availability: {e}")
        return ctx.response.error(message="Failed to get availability", errors=str(e))


@router.get("/doctor/{doctor_id}/available-slots")
def get_available_slots(
    doctor_id: str,
    date: str,  # Format: YYYY-MM-DD
    ctx: Context = Depends(get_context),
):
    """
    Get available time slots for a doctor on a specific date.
    Considers availability, time off, and existing appointments.
    """
    try:
        slot_date = datetime.strptime(date, "%Y-%m-%d").date()
        day_of_week = slot_date.weekday()
        
        # Get doctor's availability for this day
        availability_query = select(DoctorAvailability).where(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.day_of_week == day_of_week,
            DoctorAvailability.is_active == True,
        )
        
        availabilities = ctx.db.exec(availability_query).all()
        
        if not availabilities:
            return ctx.response.success(
                message="No availability for this date",
                data=[]
            )
        
        # Check for time off
        time_off_start = datetime.combine(slot_date, datetime.min.time())
        time_off_end = datetime.combine(slot_date, datetime.max.time())
        
        timeoff_query = select(DoctorTimeOff).where(
            DoctorTimeOff.doctor_id == doctor_id,
            DoctorTimeOff.start_datetime <= time_off_end,
            DoctorTimeOff.end_datetime >= time_off_start,
        )
        
        time_offs = ctx.db.exec(timeoff_query).all()
        
        # Get existing appointments
        appointment_query = select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.start_time >= time_off_start,
            Appointment.start_time < time_off_end,
            Appointment.status.in_(["scheduled", "completed"]),
        )
        
        existing_appointments = ctx.db.exec(appointment_query).all()
        
        # Generate available slots
        available_slots = []
        
        for avail in availabilities:
            current_time = datetime.combine(slot_date, avail.start_time)
            end_time = datetime.combine(slot_date, avail.end_time)
            slot_duration = timedelta(minutes=avail.slot_duration_minutes)
            
            while current_time + slot_duration <= end_time:
                slot_start = current_time
                slot_end = current_time + slot_duration
                
                # Check if slot overlaps with time off
                is_in_timeoff = any(
                    slot_start < timeoff.end_datetime
                    and slot_end > timeoff.start_datetime
                    for timeoff in time_offs
                )
                
                # Check if slot is already booked
                is_booked = any(
                    slot_start < app.end_time and slot_end > app.start_time
                    for app in existing_appointments
                )
                
                if not is_in_timeoff and not is_booked:
                    available_slots.append({
                        "start_time": slot_start.isoformat(),
                        "end_time": slot_end.isoformat(),
                    })
                
                current_time = slot_start + slot_duration
        
        return ctx.response.success(
            message="Available slots retrieved",
            data=available_slots
        )
    except ValueError:
        return ctx.response.error(message="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        return ctx.response.error(message="Failed to get slots", errors=str(e))


@router.post("/create")
def create_appointment(
    appointment_data: dict,
    ctx: Context = Depends(get_context),
):
    """
    Create a new appointment.
    Required fields: doctor_id, start_time, end_time
    Optional fields: reason, notes
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        doctor_id = appointment_data.get("doctor_id")
        start_time_str = appointment_data.get("start_time")
        end_time_str = appointment_data.get("end_time")
        reason = appointment_data.get("reason")
        notes = appointment_data.get("notes")
        allowChatAccess = bool(appointment_data.get("allowChatAccess", False))
        allowDetailAccess = bool(appointment_data.get("allowDetailAccess", False))
        
        start_time = datetime.fromisoformat(start_time_str)
        end_time = datetime.fromisoformat(end_time_str)
        
        # Verify doctor exists
        doctor_query = select(Users).where(Users.userid == doctor_id)
        doctor = ctx.db.exec(doctor_query).first()
        
        if not doctor:
            return ctx.response.error(message="Doctor not found")
        
        # Check if slot is still available
        existing_query = select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.start_time < end_time,
            Appointment.end_time > start_time,
            Appointment.status.in_(["scheduled", "completed"]),
        )
        
        if ctx.db.exec(existing_query).first():
            return ctx.response.error(message="Time slot is no longer available")
        
        
        patient = get_user_by_id(ctx.user.user_id, ctx)
        doctor = get_user_by_id(doctor_id, ctx)
        
        meet_link = create_meet_link(
            title=f"Appointment with {doctor.username}",
            start_time=start_time,
            attendees=[patient.email, doctor.email],
            duration_minutes=int((end_time - start_time).total_seconds() // 60)
        )
        
        # Create appointment
        appointment = Appointment(
            doctor_id=doctor_id,
            patient_id=ctx.user.user_id,
            start_time=start_time,
            end_time=end_time,
            status="scheduled",
            reason=reason,
            notes=notes,
            meet_link=meet_link
        )
        

        
        doctor_patient_query = select(DoctorVPatient).where(
            DoctorVPatient.doctor_id == doctor_id,
            DoctorVPatient.patient_id == ctx.user.user_id
        )
        
        if not ctx.db.exec(doctor_patient_query).first():
            doctor_patient = DoctorVPatient(
                id=str(uuid.uuid4()),
                doctor_id=doctor_id,
                patient_id=ctx.user.user_id,
                description="",
                allowChatAccess=allowChatAccess,
                allowDetailAccess=allowDetailAccess,
            )
            ctx.db.add(doctor_patient)
        elif allowChatAccess or allowDetailAccess:
            doctor_patient = ctx.db.exec(doctor_patient_query).first()
            if allowChatAccess:
                doctor_patient.allowChatAccess = True
            if allowDetailAccess:
                doctor_patient.allowDetailAccess = True
            ctx.db.add(doctor_patient)
                
        ctx.db.add(appointment)
        ctx.db.commit()
        ctx.db.refresh(appointment)
        
        send_email(
            to_email=patient.email,
            subject="MindCare - Appointment Created",
            html_body=f"<div><p>Dear {patient.username},</p><p>Your appointment with Dr. {doctor.username} has been scheduled for {start_time.strftime('%Y-%m-%d %H:%M')}.</p><p>Meeting Link: <a href='{meet_link}'>{meet_link}</a></p><p>Thank you for using MindCare!</p></div>"
        )
        
        return ctx.response.success(
            message="Appointment created successfully",
            data=ctx.serialize(appointment)
        )
    except ValueError as e:
        return ctx.response.error(message="Invalid datetime format")
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to create appointment", errors=str(e))


@router.get("/user")
def get_user_appointments(
    ctx: Context = Depends(get_context),
):
    """
    Get all appointments for the current user (as patient).
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = (
            select(Appointment)
            .where(Appointment.patient_id == ctx.user.user_id)
            .order_by(Appointment.start_time.asc())
        )
        
        appointments = ctx.db.exec(query).all()

        data = []
        for appointment in appointments:
            item = ctx.serialize(appointment)
            doctor_info = ctx.db.exec(
                select(DoctorInformation).where(
                    DoctorInformation.userid == appointment.doctor_id
                )
            ).first()
            item["doctor_name"] = (
                doctor_info.full_name
                if doctor_info and doctor_info.full_name
                else "Unknown Doctor"
            )
            item["avatar"] = get_avatar(appointment.doctor_id, ctx)
            data.append(item)

        return ctx.response.success(message="Appointments retrieved", data=data)
    except Exception as e:
        return ctx.response.error(message="Failed to get appointments", errors=str(e))


@router.patch("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    ctx: Context = Depends(get_context),
):
    """
    Cancel an appointment.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(Appointment).where(Appointment.id == appointment_id)
        appointment = ctx.db.exec(query).first()
        
        if not appointment:
            return ctx.response.error(message="Appointment not found")
        
        # Verify user is the patient who booked this
        if appointment.patient_id != ctx.user.user_id:
            return ctx.response.error(message="Unauthorized")
        
        if appointment.status == "cancelled":
            return ctx.response.error(message="Appointment already cancelled")
        
        appointment.status = "cancelled"
        ctx.db.add(appointment)
        ctx.db.commit()
        
        return ctx.response.success(
            message="Appointment cancelled successfully",
            data=ctx.serialize(appointment)
        )
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to cancel appointment", errors=str(e))


# ======================= AVAILABILITY MANAGEMENT =======================

@router.get("/doctor-availability/get")
def get_doctor_availability_management(
    ctx: Context = Depends(get_context),
):
    """
    Get current doctor's availability schedule for management page.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(DoctorAvailability).where(
            DoctorAvailability.doctor_id == ctx.user.user_id
        )
        
        availability = ctx.db.exec(query).all()
        data = [ctx.serialize(a) for a in availability]
        
        return ctx.response.success(
            message="Availability retrieved",
            data=data
        )
    except Exception as e:
        return ctx.response.error(message="Failed to get availability", errors=str(e))


@router.post("/doctor-availability/create")
def create_availability(
    availability_data: dict,
    ctx: Context = Depends(get_context),
):
    """
    Create a new availability slot for the doctor.
    Required: day_of_week (0-6), start_time, end_time
    Optional: slot_duration_minutes (default 30)
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        day_of_week = availability_data.get("day_of_week")
        start_time_str = availability_data.get("start_time")
        end_time_str = availability_data.get("end_time")
        slot_duration = availability_data.get("slot_duration_minutes", 30)
        
        if day_of_week is None or not start_time_str or not end_time_str:
            return ctx.response.error(message="Missing required fields")
        
        # Parse time strings (format: HH:MM)
        from datetime import time as datetime_time
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.strptime(end_time_str, "%H:%M").time()
        
        if start_time >= end_time:
            return ctx.response.error(message="Start time must be before end time")
        
        # Check if this availability already exists
        existing_query = select(DoctorAvailability).where(
            DoctorAvailability.doctor_id == ctx.user.user_id,
            DoctorAvailability.day_of_week == day_of_week,
            DoctorAvailability.start_time == start_time,
            DoctorAvailability.end_time == end_time,
        )
        
        if ctx.db.exec(existing_query).first():
            return ctx.response.error(message="This availability slot already exists")
        
        availability = DoctorAvailability(
            doctor_id=ctx.user.user_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            slot_duration_minutes=slot_duration,
            is_active=True,
        )
        
        ctx.db.add(availability)
        ctx.db.commit()
        ctx.db.refresh(availability)
        
        return ctx.response.success(
            message="Availability created successfully",
            data=ctx.serialize(availability)
        )
    except ValueError:
        return ctx.response.error(message="Invalid time format. Use HH:MM")
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to create availability", errors=str(e))


@router.patch("/doctor-availability/{availability_id}")
def update_availability(
    availability_id: int,
    availability_data: dict,
    ctx: Context = Depends(get_context),
):
    """
    Update an availability slot.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(DoctorAvailability).where(
            DoctorAvailability.id == availability_id,
            DoctorAvailability.doctor_id == ctx.user.user_id,
        )
        
        availability = ctx.db.exec(query).first()
        
        if not availability:
            return ctx.response.error(message="Availability not found")
        
        # Update fields
        if "is_active" in availability_data:
            availability.is_active = availability_data["is_active"]
        
        if "slot_duration_minutes" in availability_data:
            availability.slot_duration_minutes = availability_data["slot_duration_minutes"]
        
        if "start_time" in availability_data:
            start_time = datetime.strptime(
                availability_data["start_time"], "%H:%M"
            ).time()
            availability.start_time = start_time
        
        if "end_time" in availability_data:
            end_time = datetime.strptime(
                availability_data["end_time"], "%H:%M"
            ).time()
            availability.end_time = end_time
        
        ctx.db.add(availability)
        ctx.db.commit()
        ctx.db.refresh(availability)
        
        return ctx.response.success(
            message="Availability updated successfully",
            data=ctx.serialize(availability)
        )
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to update availability", errors=str(e))


@router.delete("/doctor-availability/{availability_id}")
def delete_availability(
    availability_id: int,
    ctx: Context = Depends(get_context),
):
    """
    Delete an availability slot.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(DoctorAvailability).where(
            DoctorAvailability.id == availability_id,
            DoctorAvailability.doctor_id == ctx.user.user_id,
        )
        
        availability = ctx.db.exec(query).first()
        
        if not availability:
            return ctx.response.error(message="Availability not found")
        
        ctx.db.delete(availability)
        ctx.db.commit()
        
        return ctx.response.success(message="Availability deleted successfully")
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to delete availability", errors=str(e))


# ======================= TIME OFF MANAGEMENT =======================

@router.get("/doctor-timeoff/get")
def get_doctor_timeoff(
    ctx: Context = Depends(get_context),
):
    """
    Get current doctor's time off periods.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(DoctorTimeOff).where(
            DoctorTimeOff.doctor_id == ctx.user.user_id,
            DoctorTimeOff.end_datetime >= datetime.utcnow(),
        ).order_by(DoctorTimeOff.start_datetime)
        
        time_offs = ctx.db.exec(query).all()
        data = [ctx.serialize(t) for t in time_offs]
        
        return ctx.response.success(
            message="Time off periods retrieved",
            data=data
        )
    except Exception as e:
        return ctx.response.error(message="Failed to get time off", errors=str(e))


@router.post("/doctor-timeoff/create")
def create_timeoff(
    timeoff_data: dict,
    ctx: Context = Depends(get_context),
):
    """
    Create a time off period.
    Required: start_datetime, end_datetime (ISO format)
    Optional: reason
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        start_datetime_str = timeoff_data.get("start_datetime")
        end_datetime_str = timeoff_data.get("end_datetime")
        reason = timeoff_data.get("reason")
        
        if not start_datetime_str or not end_datetime_str:
            return ctx.response.error(message="Missing required fields")
        
        start_datetime = datetime.fromisoformat(start_datetime_str)
        end_datetime = datetime.fromisoformat(end_datetime_str)
        
        if start_datetime >= end_datetime:
            return ctx.response.error(message="Start date must be before end date")
        
        time_off = DoctorTimeOff(
            doctor_id=ctx.user.user_id,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            reason=reason,
        )
        
        ctx.db.add(time_off)
        ctx.db.commit()
        ctx.db.refresh(time_off)
        
        return ctx.response.success(
            message="Time off created successfully",
            data=ctx.serialize(time_off)
        )
    except ValueError:
        return ctx.response.error(message="Invalid datetime format. Use ISO format")
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to create time off", errors=str(e))


@router.delete("/doctor-timeoff/{timeoff_id}")
def delete_timeoff(
    timeoff_id: int,
    ctx: Context = Depends(get_context),
):
    """
    Delete a time off period.
    """
    try:
        if not ctx.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        query = select(DoctorTimeOff).where(
            DoctorTimeOff.id == timeoff_id,
            DoctorTimeOff.doctor_id == ctx.user.user_id,
        )
        
        time_off = ctx.db.exec(query).first()
        
        if not time_off:
            return ctx.response.error(message="Time off not found")
        
        ctx.db.delete(time_off)
        ctx.db.commit()
        
        return ctx.response.success(message="Time off deleted successfully")
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message="Failed to delete time off", errors=str(e))
