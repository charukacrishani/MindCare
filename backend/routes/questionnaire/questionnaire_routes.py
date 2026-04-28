from datetime import datetime
from typing import List
import uuid
from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.questionnaire import QuestionnaireResponse
from utils.c_types import AnswerItem, QuestionnaireSubmitResponse
from utils.dass21_level import get_dass21_level

router = APIRouter(prefix="/api/questionnaire", tags=["Questionnaire"])

# ─── POST /api/questionnaire/submit ──────────────────────────────────────────
@router.post("/submit")
def submit_questionnaire(
    req: dict[int, int],   
    ctx: Context = Depends(get_context),
):
    try:
        
        # Validate & map all 21 answers
        numeric = {k - 1: v for k, v in req.items()}
            
        depression_idx = [2, 4, 9, 12, 15, 16, 20]
        anxiety_idx = [1, 3, 6, 8, 14, 18, 19]
        stress_idx = [0, 5, 7, 10, 11, 13, 17]

        depression_score = sum(numeric[i] for i in depression_idx)
        anxiety_score = sum(numeric[i] for i in anxiety_idx)
        stress_score = sum(numeric[i] for i in stress_idx)

        # DASS-21 requires multiplying by 2
        depression_score *= 2
        anxiety_score *= 2
        stress_score *= 2
        
        # Persist — mirrors how Chats/Messages are saved in chat_routes.py
        record = QuestionnaireResponse(
            id= str(uuid.uuid4()),
            userid=ctx.user.user_id,
            q1=numeric[0],   q2=numeric[1],   q3=numeric[2],
            q4=numeric[3],   q5=numeric[4],   q6=numeric[5],
            q7=numeric[6],   q8=numeric[7],   q9=numeric[8],
            q10=numeric[9], q11=numeric[10], q12=numeric[11],
            q13=numeric[12], q14=numeric[13], q15=numeric[14],
            q16=numeric[15], q17=numeric[16], q18=numeric[17],
            q19=numeric[18], q20=numeric[19], q21=numeric[20],
            stress_score= stress_score,
            anxiety_score= anxiety_score,
            depression_score= depression_score,

        )
        ctx.db.add(record)
        ctx.db.commit()
        ctx.db.refresh(record)

        return ctx.response.success(
            data=QuestionnaireSubmitResponse(
                id=record.id,
                stress_score= record.stress_score,
                anxiety_score= record.anxiety_score,
                depression_score= record.depression_score,
            )
        )

    except ValueError as e:
        return ctx.response.error(message=str(e))
    except Exception as e:
        return ctx.response.error(message=str(e))


# ─── GET /api/questionnaire/ ──────────────────────────────────────────────────
# All responses for the logged-in user, newest first
@router.get("/")
def get_my_responses(ctx: Context = Depends(get_context)):
    query = (
        select(QuestionnaireResponse)
        .where(QuestionnaireResponse.userid == ctx.user.user_id)
        .order_by(QuestionnaireResponse.date.desc())
    )
    responses = ctx.db.exec(query).all()
    data = []
    for row in responses:
        level_anxiety = get_dass21_level(row.anxiety_score)
        level_depression = get_dass21_level(row.depression_score)
        level_stress = get_dass21_level(row.stress_score)

        data.append({
            "id": row.id,
            "anxiety_score": level_anxiety,
            "depression_score": level_depression,
            "stress_score": level_stress,
            "date": row.date.isoformat() if row.date else None,
        })
    return ctx.response.success(data=ctx.serialize(data))


# ─── GET /api/questionnaire/{response_id} ────────────────────────────────────
# Single response by ID — only if it belongs to the current user
@router.get("/{response_id}")
def get_response(response_id: int, ctx: Context = Depends(get_context)):
    query = select(QuestionnaireResponse).where(
        QuestionnaireResponse.id     == response_id,
        QuestionnaireResponse.userid == ctx.user.user_id,
    )
    record = ctx.db.exec(query).first()

    if record is None:
        return ctx.response.error(message="Response not found")

    return ctx.response.success(data=ctx.serialize(record))

@router.get("/patient")
def get_response(patient: int, ctx: Context = Depends(get_context)):
    query = select(QuestionnaireResponse).where(
        QuestionnaireResponse.userid == patient,
    )
    record = ctx.db.exec(query).mappings().all()

    if record is None:
        return ctx.response.error(message="Response not found")
    

    return ctx.response.success(data=ctx.serialize(record))