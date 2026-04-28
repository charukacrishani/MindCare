import json

from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import select
from sqlalchemy import func
from datetime import date, datetime, timedelta

from chatbot.chatbot_chatgpt import MentalHealthChatbot_GPT
from context import Context, get_context
from models.doctor_v_patient import Appointment, DoctorReview
from models.questionnaire import QuestionnaireResponse
from models.user import DoctorInformation, UserInformation, Users
from routes.avatar.avatar_routes import get_avatar
from utils.dass21_level import get_dass21_level


router = APIRouter(prefix="/api/dashboard/users", tags=["Users Dashboard"])
chatbot = MentalHealthChatbot_GPT()

@router.get("/current")
def get_current_stats_dashboard(ctx: Context = Depends(get_context)):
    query = (
        select(QuestionnaireResponse)
        .where(QuestionnaireResponse.userid == ctx.user.user_id)
        .order_by(QuestionnaireResponse.date.desc()).limit(1)
    )
    responses = ctx.db.exec(query).all()
    if not responses:
        return ctx.response.success(data={
            "anxiety_score": 0,
            "depression_score": 0,
            "stress_score": 0,
            "date": None
        })
    
    response = responses[0]
    a_level = get_dass21_level(response.anxiety_score)
    d_level = get_dass21_level(response.depression_score)
    s_level = get_dass21_level(response.stress_score)
    res = {
        "anxiety_score": a_level,
        "depression_score": d_level,
        "stress_score": s_level,
        "date": response.date.isoformat() if response.date else None
    }
    
    
    return ctx.response.success(data=ctx.serialize(res))

    

@router.get("/trend")
def get_trend_data(ctx: Context = Depends(get_context)):
   
    query = (
        select(QuestionnaireResponse)
        .where(
            (QuestionnaireResponse.userid == ctx.user.user_id)
        )
        .order_by(func.date(QuestionnaireResponse.date).desc())
        .limit(5)
    )
    
    responses = ctx.db.exec(query).all()
    
    # Generate all dates for last 5 days including today
    trend_data = []

    # how many empty slots needed
    missing = max(0, 5 - len(responses)) if responses else 5

    # add empty entries FIRST
    for _ in range(missing):
        trend_data.append({
            "anxiety_score": 0,
            "depression_score": 0,
            "stress_score": 0,
            "date": ""
        })

    # then add actual response data (max 5 total)
    if responses:
        for response in responses[:5]:
            trend_data.append({
                "anxiety_score": response.anxiety_score,
                "depression_score": response.depression_score,
                "stress_score": response.stress_score,
                "date": response.date
            })
    
    return ctx.response.success(data=trend_data)


@router.get("/tips")
def get_tips_dashboard(ctx: Context = Depends(get_context)):
    query = (
        select(QuestionnaireResponse)
        .where(QuestionnaireResponse.userid == ctx.user.user_id)
        .order_by(QuestionnaireResponse.date.desc()).limit(1)
    )
    responses = ctx.db.exec(query).all()
    if not responses:
        tips = get_tips_for_level("none")
        return ctx.response.success(data=tips)
    
    queryTips = (
        select(UserInformation)
        .where(UserInformation.userid == ctx.user.user_id)
    )
    
    user = ctx.db.exec(queryTips).first()
    if user and user.tips:
        if user.tips_id and user.tips_id == responses[0].id:
            user_tips = json.loads(user.tips)
            return ctx.response.success(data=user_tips)
    
    response = responses[0]
    a_score = response.anxiety_score
    d_score = response.depression_score
    s_score = response.stress_score
    
    levels = {
        "anxiety": a_score,
        "depression": d_score,
        "stress": s_score
    }
    
    chatbot_tips = chatbot.get_tips(list(levels.values()))
    
    # Save tips to user information
    if user:
        user.tips = json.dumps(chatbot_tips)
        user.tips_id = response.id
        ctx.db.add(user)
        ctx.db.commit()
    
    return ctx.response.success(data=chatbot_tips)


def get_tips_for_level(level: str):
    # Tips are tailored based on stress levels
    tips = []
    if level == "none":
        tips.append({"bold": "Maintain a healthy lifestyle", "light": "continue practicing good habits to keep stress levels low"})
        tips.append({"bold": "Stay connected with loved ones", "light": "maintain strong social connections for emotional support"})
        tips.append({"bold": "Practice gratitude", "light": "focus on positive aspects of life to boost mood"})
    return tips

@router.get("/appointments")
def get_appointments_dashboard(ctx: Context = Depends(get_context)):
    query = (
        select(Appointment, DoctorInformation.full_name.label("doctor_name"))
        .join(DoctorInformation, Appointment.doctor_id == DoctorInformation.userid)
        .where(Appointment.patient_id == ctx.user.user_id)
        .order_by(Appointment.start_time.desc())
        .limit(4)
    )
    data = []
    results = ctx.db.exec(query).all()

    for appointment, doctor_name in results:
        item = appointment.dict()
        item["doctor_name"] = doctor_name
        item["avatar"] = get_avatar(appointment.doctor_id, ctx)
        data.append(item)

    return ctx.response.success(data=data)


@router.get("/counselors")
def get_counselors_dashboard(ctx: Context = Depends(get_context)):
    query = (
        select(
            Users.userid,
            DoctorInformation.full_name,
            func.count(DoctorReview.id).label("review_count")
        )
        .join(DoctorInformation, Users.userid == DoctorInformation.userid)
        .outerjoin(DoctorReview, DoctorReview.doctor_id == Users.userid)
        .where(Users.role == "counselor")
        .group_by(Users.userid, DoctorInformation.full_name)
        .order_by(func.count(DoctorReview.id).desc())
        .limit(4)
    )

    counselors = []
    results = ctx.db.exec(query).all()

    for userid, full_name, review_count in results:
        counselors.append({
            "userid": userid,
            "full_name": full_name,
            "review_count": review_count,
            "avatar": get_avatar(userid, ctx)
        })

    return ctx.response.success(data=counselors)