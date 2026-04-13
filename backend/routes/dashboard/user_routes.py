from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import select
from sqlalchemy import func
from datetime import datetime, timedelta

from context import Context, get_context
from models.questionnaire import QuestionnaireResponse


router = APIRouter(prefix="/api/dashboard/users", tags=["Users Dashboard"])

@router.get("/current")
def get_current_stats_dashboard(ctx: Context = Depends(get_context)):
    query = (
        select(QuestionnaireResponse)
        .where(QuestionnaireResponse.userid == ctx.user.user_id)
        .order_by(QuestionnaireResponse.date.desc()).limit(1)
    )
    responses = ctx.db.exec(query).all()
    return ctx.response.success(data=ctx.serialize(responses))


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
    
    response = responses[0]
    a_score = response.anxiety_score
    d_score = response.depression_score
    s_score = response.stress_score
    
    levels = set()
    if a_score >= 15:
        levels.add("anxiety")
    if d_score >= 15:
        levels.add("depression")
    if s_score >= 26:
        levels.add("stress")
    
    tips = []
    for level in levels:
        tips.extend(get_tips_for_level(level))
    
    return ctx.response.success(data=tips)


def get_tips_for_level(level: str):
    # Tips are tailored based on stress levels
    tips = []
    if level == "anxiety":
        tips.append({"bold": "Practice deep breathing exercises", "light": "help calm your mind and reduce anxiety"})
        tips.append({"bold": "Engage in regular physical activity", "light": "reduces anxiety levels and improves mood"})
        tips.append({"bold": "Try mindfulness meditation", "light": "stay present and reduce anxious thoughts"})
    elif level == "depression":
        tips.append({"bold": "Reach out to friends or family", "light": "get support and maintain social connections"})
        tips.append({"bold": "Engage in activities you enjoy", "light": "boost your mood and find moments of joy"})
        tips.append({"bold": "Consider professional help", "light": "if feelings of depression persist"})
    elif level == "stress":
        tips.append({"bold": "Take breaks throughout the day", "light": "relax and recharge your energy"})
        tips.append({"bold": "Practice time management", "light": "reduce stress and improve productivity"})
        tips.append({"bold": "Engage in hobbies", "light": "spend time on activities that bring you joy"})
    elif level == "none":
        tips.append({"bold": "Maintain a healthy lifestyle", "light": "continue practicing good habits to keep stress levels low"})
        tips.append({"bold": "Stay connected with loved ones", "light": "maintain strong social connections for emotional support"})
        tips.append({"bold": "Practice gratitude", "light": "focus on positive aspects of life to boost mood"})
    return tips