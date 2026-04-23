import json

from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import select
from sqlalchemy import func
from datetime import datetime, timedelta

from chatbot.chatbot_gemini import MentalHealthChatbot_GEMINI
from context import Context, get_context
from models.questionnaire import QuestionnaireResponse
from models.user import UserInformation, Users
from utils.dass21_level import get_dass21_level


router = APIRouter(prefix="/api/dashboard/users", tags=["Users Dashboard"])
chatbot = MentalHealthChatbot_GEMINI()

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
    # Get data from last 5 days, with averages for multiple entries per day
    five_days_ago = datetime.utcnow() - timedelta(days=5)
    
    query = (
        select(
            func.date(QuestionnaireResponse.date).label("date"),
            func.avg(QuestionnaireResponse.anxiety_score).label("anxiety_score"),
            func.avg(QuestionnaireResponse.depression_score).label("depression_score"),
            func.avg(QuestionnaireResponse.stress_score).label("stress_score")
        )
        .where(
            (QuestionnaireResponse.userid == ctx.user.user_id) &
            (QuestionnaireResponse.date >= five_days_ago)
        )
        .group_by(func.date(QuestionnaireResponse.date))
        .order_by(func.date(QuestionnaireResponse.date).asc())
    )
    
    responses = ctx.db.exec(query).all()
    
    # Create a dictionary to map dates to scores
    data_dict = {
        (response.date if isinstance(response.date, str) else response.date.isoformat()): {
            "anxiety_score": float(response.anxiety_score) if response.anxiety_score else 0,
            "depression_score": float(response.depression_score) if response.depression_score else 0,
            "stress_score": float(response.stress_score) if response.stress_score else 0,
        }
        for response in responses
    }
    
    # Generate all dates for last 5 days including today
    trend_data = []
    for i in range(5):
        date = (datetime.utcnow() - timedelta(days=4-i)).date()
        date_str = date.isoformat()
        
        if date_str in data_dict:
            trend_data.append({
                **data_dict[date_str],
                "date": date.strftime("%a")
            })
        else:
            trend_data.append({
                "anxiety_score": 0,
                "depression_score": 0,
                "stress_score": 0,
                "date": date.strftime("%a")
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