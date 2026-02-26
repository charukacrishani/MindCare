from typing import List, Optional
from pydantic import BaseModel


class MessageParsed(BaseModel):
    questionid: str
    role: str
    content: str

class NewSession(BaseModel):
    chatid: str
    questionid: str
    question: str

class SubmitRequest(BaseModel):
    initialquestion: Optional[str] = None
    questionid: str
    answertext: str
    
class SubmitResponse(BaseModel):
    chatid: str
    question: str
    questionid: str
    done: bool
    
class MessagesResponse(BaseModel):
    chatid: str
    isActive: bool
    messages: List[MessageParsed]

class AnswerItem(BaseModel):
    id: int
    answer: int

class QuestionnaireSubmitResponse(BaseModel):
    id:     str
    depression_score: int 
    anxiety_score: int 
    stress_score: int 
