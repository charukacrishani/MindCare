from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends
from sqlmodel import select
from chatbot.chatbot_chatgpt import MentalHealthChatbot_GPT
from chatbot.chatbot_gemini import MentalHealthChatbot_GEMINI
from context import Context, get_context
from models import Chats
from models.chats import Messages
from utils.c_types import MessageParsed, MessagesResponse, NewSession, SubmitRequest, SubmitResponse

router = APIRouter(prefix="/api/chats", tags=["Chats"])
chatbot = MentalHealthChatbot_GPT()

def create_chat(ctx: Context, submitreq: SubmitRequest):
    query = select(Chats).where(Chats.userid == ctx.user.user_id, Chats.active == True)
    chat = ctx.db.exec(query).first()
    
    if chat is not None:
        raise ValueError("Another chat is already active") 
    
    chatid = str(uuid.uuid4())
    newChat = Chats(chatid=chatid, date=datetime.utcnow(), userid=ctx.user.user_id, active=True)
    ctx.db.add(newChat)
    
    newMessage = Messages(chatid=chatid,question=submitreq.initialquestion, messageid=submitreq.questionid)
    ctx.db.add(newMessage)
    
    ctx.db.commit()
    
    return chatid

@router.post("/submit")
def process_message(submitreq: SubmitRequest, chatid: Optional[str] = None, ctx : Context = Depends(get_context)):
    try:
        if chatid is None:
            chatid = create_chat(ctx, submitreq)
    except ValueError as e:
        return ctx.response.error(message=str(e))
        
    try:
        # check if chat exists
        query = select(Chats).where(Chats.userid == ctx.user.user_id, Chats.chatid == chatid, Chats.active == True)
        chat = ctx.db.exec(query).first()
        
        if chat is None:
            return ctx.response.error(message='chat is inactive or not found')
        
        # check if question exists
        query = select(Messages).where(
            Messages.messageid == submitreq.questionid,
            Messages.chatid == chatid,
            Messages.answered == False
        )
        message =  ctx.db.exec(query).first()
        
        if message is None:
            return ctx.response.error(message='question id is not found')
        
        message.answer = submitreq.answertext
        message.answered = True
        ctx.db.add(message)
        
        messagehistory = get_all_messages_of_session(ctx, chatid, new_answer=submitreq.answertext, new_answer_id=message.messageid)
        
        if len(messagehistory)/2 > chatbot.max_questions:
            questionid = str(uuid.uuid4())
            finalResponse = chatbot.analyze_conversation(messagehistory)
            message = Messages(messageid=questionid, question=finalResponse, chatid=chatid)
            ctx.db.add(message)
            ctx.db.commit()
            return ctx.response.success(data=SubmitResponse(done=True, question=finalResponse, questionid=questionid, chatid=message.chatid))
        else:
            next_question = chatbot.generate_next_question(messagehistory)
            questionid = str(uuid.uuid4())
            message = Messages(messageid=questionid, question=next_question, chatid=chatid)
            ctx.db.add(message)
            ctx.db.commit()        
            return ctx.response.success(data=SubmitResponse(done=False, question=next_question, questionid=questionid, chatid=message.chatid))
    except Exception as e:
        return ctx.response.error(message=str(e))
    
    
@router.post("/end-chat")
def process_message(chatid: str, ctx : Context = Depends(get_context)):
    query = select(Chats).where(Chats.userid == ctx.user.user_id, Chats.chatid == chatid, Chats.active == True)
    chat = ctx.db.exec(query).first()
    
    if chat is None:
        return ctx.response.error(message='chat is inactive or not found')
    
    messagehistory = get_all_messages_of_session(ctx, chatid)
    
    result = chatbot.analyze_conversation(messagehistory)
    
    chat.active = False
    questionid = str(uuid.uuid4())
    message = Messages(messageid=questionid, question=result, chatid=chatid)
    ctx.db.add(message)
    ctx.db.commit()
    return ctx.response.success(data=SubmitResponse(done=True, question=result, questionid=questionid, chatid=chatid))

@router.get("/")
def get_all_chats(ctx: Context = Depends(get_context)):
    query = select(Chats).where(Chats.userid == ctx.user.user_id).order_by(Chats.date.desc())
    chats = ctx.db.exec(query).all()
    
    return ctx.response.success(data=ctx.serialize(chats))

@router.get("/latest")
def get_active_chat(ctx: Context = Depends(get_context)):
    query = select(Chats).where(Chats.userid == ctx.user.user_id, Chats.active == True)
    chat = ctx.db.exec(query).first()
    
    if chat is None:
        return ctx.response.error(message='no active chat found')
    
    messages = get_all_messages_of_session(ctx, chat.chatid)
    
    response = MessagesResponse(chatid=chat.chatid, messages=messages, isActive=chat.active)
    
    return ctx.response.success(data=ctx.serialize(response))

@router.get('/messages')
def get_chat_messages(chatid: str, ctx: Context = Depends(get_context)):
    query = select(Chats).where(Chats.chatid == chatid, Chats.userid == ctx.user.user_id)
    chat = ctx.db.exec(query).first()
    
    if chat is None:
        return ctx.response.error(message='chat not found')
    
    messages = get_all_messages_of_session(ctx, chatid)
    
    response = MessagesResponse(chatid=chatid, messages=messages, isActive=chat.active)
    
    return ctx.response.success(data=ctx.serialize(response))    

    
def get_all_messages_of_session(ctx: Context, chatid: str, new_answer: Optional[str] = None, new_answer_id: Optional[str] = None) -> List[MessageParsed]:
    query = select(Messages).where(Messages.chatid == chatid).order_by(Messages.date.asc())
    messages = ctx.db.exec(query).all()

    messages_parsed: List[MessageParsed] = []

    for m in messages:
        messages_parsed.append(MessageParsed(role='assistant', content=m.question, questionid=m.messageid))
        if m.answer != '':
            messages_parsed.append(MessageParsed(role='user', content=m.answer, questionid=m.messageid))
        else:
            if new_answer:
                messages_parsed.append(MessageParsed(role='user', content=new_answer, questionid=new_answer_id))
                new_answer = None

    if new_answer:
        messages_parsed.append(MessageParsed(role='user', content=new_answer, questionid=new_answer_id))

    return messages_parsed
