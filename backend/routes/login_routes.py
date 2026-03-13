from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from db import get_session
from models import Users
from utils.hash import verify_password
from utils.responses import ResponseHelper
from starlette import status
from utils.auth import create_access_token

router = APIRouter(prefix="/api/login", tags=["Login"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("")
def userLogin(request: LoginRequest, session: Session = Depends(get_session)):
    query = select(Users).where(Users.username == request.username)
    user = session.exec(query).first()
    
    if user is None:
        return ResponseHelper.error('User does not exist', status.HTTP_401_UNAUTHORIZED)
    
    if not verify_password(request.password, user.password):
        return ResponseHelper.error('Invalid username or password', status.HTTP_401_UNAUTHORIZED)
    
    token = create_access_token({ "user_id": user.userid })
    
    response = JSONResponse(content={"success": True})
    response.set_cookie(
        key="mindcare",
        value=token,
        httponly=True,
        secure=False,
        max_age=60 * 60,
        samesite="lax"
    )
    
    return response

@router.post("/revoke-session")
def userLogout():
    response = JSONResponse(content={"success": True})
    response.delete_cookie(key="mindcare")
    return response