from datetime import datetime, timedelta
from typing import List
import uuid
from fastapi import APIRouter, Depends
from openai import BaseModel
from sqlmodel import Session, select
from context import Context, get_context_unverified
from db import get_session
from models import Users
from utils.send_email import send_email
from utils.hash import hash_password
from utils.responses import ResponseHelper

router = APIRouter(prefix="/api/register", tags=["Register"])

class VerifyInfo(BaseModel):
    email: str
    userid: str
    token: str
    created_at: datetime = datetime.utcnow()
    expires_in: int = 3600

activeVerifications: List[VerifyInfo] = []

verification_attempts: dict[str, list[datetime]] = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60

MAX_EMAIL_ATTEMPTS = 3
EMAIL_WINDOW_SECONDS = 200
email_attempts: dict[str, list[datetime]] = {}

def generate_token():
    return uuid.uuid4()

def check_rate_limit(userid: str):
    now = datetime.utcnow()
    attempts = verification_attempts.get(userid, [])

    # Keep only attempts within the window
    attempts = [t for t in attempts if (now - t).total_seconds() < WINDOW_SECONDS]

    if len(attempts) >= MAX_ATTEMPTS:
        # Too many attempts
        return False

    # Record this attempt
    attempts.append(now)
    verification_attempts[userid] = attempts
    return True

def check_email_rate_limit(userid: str):
    now = datetime.utcnow()
    attempts = email_attempts.get(userid, [])

    # Keep only attempts within the window
    attempts = [t for t in attempts if (now - t).total_seconds() < EMAIL_WINDOW_SECONDS]

    if len(attempts) >= MAX_EMAIL_ATTEMPTS:
        # Too many email requests
        return False

    # Record this attempt
    attempts.append(now)
    email_attempts[userid] = attempts
    return True


def get_valid_verification(token: str) -> VerifyInfo | None:
    """Returns the VerifyInfo if token is valid, else None"""
    global activeVerifications
    now = datetime.utcnow()
    
    # Filter out expired tokens
    activeVerifications = [
        v for v in activeVerifications
        if (now - v.created_at).total_seconds() < v.expires_in
    ]
    
    # Return matching token if it exists
    return next((v for v in activeVerifications if v.token == token), None)


@router.post("/")
def create_user(user: Users, session: Session = Depends(get_session)):
    try:
        if user.role not in ('user', 'doctor'):
            return ResponseHelper.error(message='Invalid role type')
        user.password = hash_password(user.password)

        session.add(user)
        session.commit()
        session.refresh(user)
        
        res = verification_email_helper(email=user.email, userid=user.userid, username="")
        
        if isinstance(res, Exception):
            return ResponseHelper.error(message="Verification failed", errors=res)

        return ResponseHelper.success(message="User registered. Verification email sent.")
    except Exception as e:
        session.rollback()
        return ResponseHelper.error(message=str(e))

@router.get("/verify")
def verify_user(token: str, session: Session = Depends(get_session)):
    try:
        verify_data = get_valid_verification(token)
        if not verify_data:
            return ResponseHelper.error(
                message="Invalid or expired token", status_code=400
            )

        if not check_rate_limit(verify_data.userid):
            return ResponseHelper.error(
                message=f"Too many verification attempts. Try again later.",
                status_code=429
            )

        user = session.exec(select(Users).where(Users.userid == verify_data.userid)).first()
        if not user:
            return ResponseHelper.error(
                message="User not found", status_code=404
            )

        user.isVerified = True
        session.add(user)
        session.commit()

        activeVerifications.remove(verify_data)

        return ResponseHelper.success(message="Email verified successfully!")

    except Exception as e:
        session.rollback()
        return ResponseHelper.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )

@router.post('/send-verification')
def send_verification(ctx: Context = Depends(get_context_unverified)):
    try:
        query = select(Users).where(Users.userid == ctx.user.user_id)
        user = ctx.db.exec(query).first()
        
        if user is None:
            return ctx.response.error(message='User not found')
        
        if user.isVerified:
            return ctx.response.error(message='User already verified')

        # Rate limit email sending
        if not check_email_rate_limit(user.userid):
            return ctx.response.error(
                message=f"Too many email requests. Try again later.",
                status_code=429
            )

        # Send verification email
        res = verification_email_helper(userid=user.userid, email=user.email, username="")
        if isinstance(res, Exception):
            return ctx.response.error(
                message="Verification email failed", errors=res
            )

        return ctx.response.success(message="Verification email sent successfully!")

    except Exception as e:
        return ctx.response.error(
            message='Send verification email failed', errors=str(e)
        )


        
def verification_email_helper(userid: str, email: str, username: str):
    token = generate_token()

    verify_obj = VerifyInfo(
        email=email,
        userid=str(userid),
        token=str(token)
    )
    activeVerifications.append(verify_obj)

    verify_link = f"http://localhost:8000/api/users/verify?token={str(token)}"

    res = send_email(
        to_email=email,
        subject="MindCare - Verify Account",
        html_body=f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Welcome to MindCare 💙</h2>

            <p style="font-size: 15px; color: #444;">
                Hi <b>{"there"}</b>,
            </p>

            <p style="font-size: 15px; color: #444;">
                Thanks for signing up! Please confirm your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="{verify_link}"
                style="background: #2563eb; color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Verify Email
                </a>
            </div>

            <p style="font-size: 14px; color: #666;">
                If the button doesn’t work, copy and paste this link into your browser:
            </p>

            <p style="font-size: 13px; word-break: break-all; color: #2563eb;">
                {verify_link}
            </p>
            
            <p style="font-size: 13px; word-break: break-all; color: #2563eb;">
                {str(token)}
            </p>

            <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 12px; color: #999; text-align: center;">
                If you didn’t create a MindCare account, you can safely ignore this email.
            </p>
        </div>
        """
    )
    
    return res