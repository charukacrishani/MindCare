from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
import base64

from context import Context, get_context
from models.user import Users, UserInformation
from models.doctor_v_patient import DoctorVPatient


router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get("/{patient_id}")
def get_patient(
    patient_id: str,
    ctx: Context = Depends(get_context)
):
    """
    Get patient information by ID.
    Returns patient data with name, age, imageSrc, and description.
    """
    try:
        # Fetch user data
        query = select(Users).where(Users.userid == patient_id)
        user = ctx.db.exec(query).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Fetch user information (contains age, avatar, and other details)
        info_query = select(UserInformation).where(UserInformation.userid == patient_id)
        user_info = ctx.db.exec(info_query).first()
        
        # Fetch patient description from DoctorVPatient (requires doctor_id context)
        doctor_id = ctx.user.user_id if ctx.user else None
        description = ""
        if doctor_id:
            dvp_query = select(DoctorVPatient).where(
                (DoctorVPatient.patient_id == patient_id) &
                (DoctorVPatient.doctor_id == doctor_id)
            )
            dvp_record = ctx.db.exec(dvp_query).first()
            description = dvp_record.description if dvp_record and dvp_record.description else ""
    
        
        # Build response matching frontend Patient type
        patient_data = {
            "name": f"{user.first_name} {user.last_name}",
            "age": user_info.age if user_info and user_info.age else 0,
            "imageSrc": "",
            "description": description
        }
        
        return ctx.response.success(message='Patient retrieved successfully', data=patient_data)
        
    except HTTPException as e:
        return ctx.response.error(message=e.detail)
    except Exception as e:
        return ctx.response.error(message=f'Failed to retrieve patient: {str(e)}')
