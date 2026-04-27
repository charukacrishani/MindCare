

from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import Appointment, DoctorVPatient


router = APIRouter(prefix="/api/data-consent", tags=["Data Consent"])

@router.get("/{appointment_id}")
def get_data_consent(appointment_id: int, ctx: Context = Depends(get_context)):
    queryAppointment = (
        select(Appointment).where(Appointment.id == appointment_id)
    )
    
    appointment = ctx.db.exec(queryAppointment).first()
    
    if not appointment:
        return ctx.response.error(message="Appointment not found")
    
    queryDoctorVPatient = (
        select(DoctorVPatient).where(
            (DoctorVPatient.patient_id == appointment.patient_id) &
            (DoctorVPatient.doctor_id == appointment.doctor_id)
        )
    )
    
    doctor_v_patient = ctx.db.exec(queryDoctorVPatient).first()
    if not doctor_v_patient:
        return ctx.response.error(message="Doctor-Patient relationship not found")
    
    
    data_dict = {
        "allowChatHistory": doctor_v_patient.allowChatAccess,
        "allowPersonalData": doctor_v_patient.allowDetailAccess,
    }   
    
    return ctx.response.success(data=data_dict)

@router.post("/{appointment_id}")
def give_data_consent(appointment_id: int, consent_data: dict, ctx: Context = Depends(get_context)):
    
    allow_chat_history = consent_data.get("allowChatHistory", False)
    allow_personal_data = consent_data.get("allowPersonalData", False)
    
    queryAppointment = (
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = ctx.db.exec(queryAppointment).first()
    
    if not appointment:
        return ctx.response.error(message="Appointment not found")
    
    queryDoctorVPatient = (
        select(DoctorVPatient).where(
            (DoctorVPatient.patient_id == appointment.patient_id) &
            (DoctorVPatient.doctor_id == appointment.doctor_id)
        )
    )
    
    doctor_v_patient = ctx.db.exec(queryDoctorVPatient).first()
    if not doctor_v_patient:
        return ctx.response.error(message="Doctor-Patient relationship not found")
    
    doctor_v_patient.allowChatAccess = allow_chat_history
    doctor_v_patient.allowDetailAccess = allow_personal_data
    ctx.db.add(doctor_v_patient)
    ctx.db.commit()
    
    return ctx.response.success(message="Data consent updated successfully")