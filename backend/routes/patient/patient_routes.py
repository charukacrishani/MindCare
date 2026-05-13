from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from datetime import datetime

from context import Context, get_context
from models.chats import Chats, Messages
from models.doctor_v_patient import Appointment
from models.user import Users, UserInformation
from models.doctor_v_patient import DoctorVPatient
from models.questionnaire import QuestionnaireResponse
from routes.avatar.avatar_routes import get_avatar
from utils.dass21_level import get_dass21_level


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
            "imageSrc": get_avatar(patient_id, ctx) or "",
            "description": description
        }
        
        return ctx.response.success(message='Patient retrieved successfully', data=patient_data)
        
    except HTTPException as e:
        return ctx.response.error(message=e.detail)
    except Exception as e:
        return ctx.response.error(message=f'Failed to retrieve patient: {str(e)}')


@router.get("/{patient_id}/overview")
def get_patient_overview(
    patient_id: str,
    ctx: Context = Depends(get_context)
):
    """
    Get complete patient detail data for counselor page.
    Returns profile, latest statistics, previous appointments, and chat history.
    """
    try:
        doctor_id = ctx.user.user_id if ctx.user else None
        if not doctor_id:
            raise HTTPException(status_code=401, detail="Not authenticated")

        relationship = ctx.db.exec(
            select(DoctorVPatient).where(
                DoctorVPatient.patient_id == patient_id,
                DoctorVPatient.doctor_id == doctor_id,
            )
        ).first()

        if not relationship:
            raise HTTPException(status_code=403, detail="You are not assigned to this patient")

        user = ctx.db.exec(select(Users).where(Users.userid == patient_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Patient not found")

        user_info = ctx.db.exec(
            select(UserInformation).where(UserInformation.userid == patient_id)
        ).first()

        patient_data = {
            "name": f"{user.first_name} {user.last_name}".strip(),
            "age": user_info.age if user_info and user_info.age else 0,
            "imageSrc": get_avatar(patient_id, ctx) or "",
            "description": relationship.description or "",
        }
        
        if relationship.allowDetailAccess:
            patient_data['maritalStatus'] = user_info.marital_status
            patient_data['occupation'] = user_info.occupation
            patient_data['gender'] = user_info.gender
            patient_data['sexualOrientation'] = user_info.sexual_orientation

        questionnaire_rows = ctx.db.exec(
            select(QuestionnaireResponse)
            .where(QuestionnaireResponse.userid == patient_id)
            .order_by(QuestionnaireResponse.date.desc())
            .limit(5)
        ).all()

        statistics = []
        trend = []
        for row in questionnaire_rows:
            safe_date = row.date.date().isoformat() if isinstance(row.date, datetime) else "N/A"
            level_anxiety = get_dass21_level(row.anxiety_score, "anxiety")
            level_depression = get_dass21_level(row.depression_score, "depression")
            level_stress = get_dass21_level(row.stress_score, "stress")

            statistics.append({
                "dateRange": safe_date,
                "anxiety": level_anxiety,
                "depression": level_depression,
                "stress": level_stress,
            })

            trend.append({
                "anxiety_score": row.anxiety_score,
                "depression_score": row.depression_score,
                "stress_score": row.stress_score,
                "date": row.date.isoformat() if row.date else None,
            })

        appointments_rows = ctx.db.exec(
            select(Appointment)
            .where(
                Appointment.patient_id == patient_id,
                Appointment.doctor_id == doctor_id,
            )
            .order_by(Appointment.start_time.desc())
            .limit(10)
        ).all()

        appointments = []
        for item in appointments_rows:
            appointments.append({
                "id": str(item.id),
                "date": item.start_time.strftime("%d-%m-%Y") if item.start_time else "",
                "time": item.start_time.strftime("%I:%M %p") if item.start_time else "",
                "status": item.status,
                "start_time": item.start_time.isoformat() if item.start_time else None,
                "end_time": item.end_time.isoformat() if item.end_time else None,
            })

        latest_chat = ctx.db.exec(
            select(Chats)
            .where(Chats.userid == patient_id)
            .order_by(Chats.date.desc())
        ).first()

        chat_data = {
            "date": latest_chat.date.isoformat() if latest_chat and latest_chat.date else "",
            "messages": [],
        }

        if latest_chat and relationship.allowChatAccess:
            chat_rows = ctx.db.exec(
                select(Messages)
                .where(Messages.chatid == latest_chat.chatid)
                .order_by(Messages.date.asc())
            ).all()

            parsed_messages = []
            message_count = 0
            for message in chat_rows:
                parsed_messages.append({
                    "id": f"{message.messageid}-q",
                    "sender": "counselor",
                    "text": message.question,
                })
                message_count += 1

                if message.answer:
                    parsed_messages.append({
                        "id": f"{message.messageid}-a",
                        "sender": "patient",
                        "text": message.answer,
                    })
                    message_count += 1

                if message_count >= 20:
                    break

            chat_data["messages"] = parsed_messages


        return ctx.response.success(
            message="Patient overview retrieved successfully",
            data={
                "patient": patient_data,
                "statistics": statistics,
                "trend": trend,
                "appointments": appointments,
                "chat": chat_data,
            },
        )

    except HTTPException as e:
        return ctx.response.error(message=e.detail)
    except Exception as e:
        return ctx.response.error(message=f"Failed to retrieve patient overview: {str(e)}")
