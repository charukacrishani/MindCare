from typing import Any
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from fastapi import Depends, Request
from db import get_session
from models.user import Users
from utils.auth import UserInfo, get_current_user
from utils.responses import RedirectInfo, ResponseHelper

class Context:
    def __init__(self, user: UserInfo, db: Session, request: Request):
        self.user = user          # Current user object
        self.db = db              # DB session
        self.request = request    # Optional: original request
        self.response = ResponseHelper
        
    def serialize(self, obj: Any, exclude: list[str] = None) -> Any:
        exclude = exclude or ["password"]
        if isinstance(obj, list):
            return [self.serialize(o, exclude=exclude) for o in obj]
        if hasattr(obj, "dict"):
            return obj.dict(exclude=set(exclude))
        if hasattr(obj, "__dict__"):
            return {k: v for k, v in vars(obj).items() if not k.startswith("_") and k not in exclude}

        return obj

def get_context(
    request: Request,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if current_user     is None:
        ResponseHelper.raise_http_exception(
            message='Not authenticated',
            redirect=RedirectInfo(url='/signin', value=True),
            status_code=401
        )
        
    query = select(Users).where(Users.userid == current_user.user_id)
    user = db.exec(query).first()

    if not user:
        ResponseHelper.raise_http_exception(
            message='User not found',
            status_code=404
        )

    if not user.isVerified:
        ResponseHelper.raise_http_exception(
            message="Please verify your email",
            status_code=403,
            redirect=RedirectInfo(value=True, url="/verify-email")
        )

    return Context(user=current_user, db=db, request=request)

def get_context_unverified(
    request: Request,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if current_user is None:
        ResponseHelper.raise_http_exception(
            message='Not authenticated',
            redirect=RedirectInfo(url='/signin', value=True),
            status_code=401
        )
    ctx = Context(user=current_user, db=db, request=request)
    return ctx

def get_context_html(
    current_user: UserInfo = Depends(get_current_user),
):
    if current_user is None:
        return ResponseHelper.redirect_response(url='/signin')  
    
    return None