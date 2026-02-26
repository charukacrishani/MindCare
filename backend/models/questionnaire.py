from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class QuestionnaireResponse(SQLModel, table=True):
    __tablename__ = "questionnaire_responses"

    id:     Optional[str] = Field(default=None, primary_key=True)
    userid: str = Field(foreign_key="users.userid")

    # DASS-21 answers — stored as integers 0–3
    q1:  int = Field(ge=0, le=3)
    q2:  int = Field(ge=0, le=3)
    q3:  int = Field(ge=0, le=3)
    q4:  int = Field(ge=0, le=3)
    q5:  int = Field(ge=0, le=3)
    q6:  int = Field(ge=0, le=3)
    q7:  int = Field(ge=0, le=3)
    q8:  int = Field(ge=0, le=3)
    q9:  int = Field(ge=0, le=3)
    q10: int = Field(ge=0, le=3)
    q11: int = Field(ge=0, le=3)
    q12: int = Field(ge=0, le=3)
    q13: int = Field(ge=0, le=3)
    q14: int = Field(ge=0, le=3)
    q15: int = Field(ge=0, le=3)
    q16: int = Field(ge=0, le=3)
    q17: int = Field(ge=0, le=3)
    q18: int = Field(ge=0, le=3)
    q19: int = Field(ge=0, le=3)
    q20: int = Field(ge=0, le=3)
    q21: int = Field(ge=0, le=3)
    
    depression_score: int 
    anxiety_score: int 
    stress_score: int 

    date: datetime = Field(default_factory=datetime.utcnow)
    
