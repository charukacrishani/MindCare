from datetime import datetime
from typing import List
import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from context import Context, get_context_unverified
from db import get_session
from models import Users
from utils.auth import create_access_token
from utils.send_email import send_email
from utils.hash import hash_password
from utils.responses import ResponseHelper
from pydantic import BaseModel

router = APIRouter(prefix="/api/register", tags=["Register"])

# ─────────────────────────────────────────────
# Request schema — matches the frontend form
# ─────────────────────────────────────────────

VALID_ROLES = {"user", "counselor"}

class RegisterRequest(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    role: str           # "user" | "counselor"  (frontend sends "User" → normalised below)
    password: str


# ─────────────────────────────────────────────
# In-memory verification store
# ─────────────────────────────────────────────

class VerifyInfo(BaseModel):
    email: str
    userid: str
    token: str
    created_at: datetime = datetime.utcnow()
    expires_in: int = 3600          # seconds

activeVerifications: List[VerifyInfo] = []

# Rate-limit buckets
verification_attempts: dict[str, list[datetime]] = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60

email_attempts: dict[str, list[datetime]] = {}
MAX_EMAIL_ATTEMPTS = 3
EMAIL_WINDOW_SECONDS = 200


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def generate_token() -> str:
    return str(uuid.uuid4())


def check_rate_limit(userid: str) -> bool:
    now = datetime.utcnow()
    attempts = [
        t for t in verification_attempts.get(userid, [])
        if (now - t).total_seconds() < WINDOW_SECONDS
    ]
    if len(attempts) >= MAX_ATTEMPTS:
        return False
    attempts.append(now)
    verification_attempts[userid] = attempts
    return True


def check_email_rate_limit(userid: str) -> bool:
    now = datetime.utcnow()
    attempts = [
        t for t in email_attempts.get(userid, [])
        if (now - t).total_seconds() < EMAIL_WINDOW_SECONDS
    ]
    if len(attempts) >= MAX_EMAIL_ATTEMPTS:
        return False
    attempts.append(now)
    email_attempts[userid] = attempts
    return True


def get_valid_verification(token: str) -> VerifyInfo | None:
    """Return VerifyInfo if the token exists and has not expired."""
    global activeVerifications
    now = datetime.utcnow()
    activeVerifications = [
        v for v in activeVerifications
        if (now - v.created_at).total_seconds() < v.expires_in
    ]
    return next((v for v in activeVerifications if v.token == token), None)


def send_verification_email(userid: str, email: str, username: str) -> Exception | None:
    """Queue a verification token and dispatch the email. Returns an Exception on failure."""
    token = generate_token()

    activeVerifications.append(VerifyInfo(
        email=email,
        userid=userid,
        token=token,
    ))

    return send_email(
        to_email=email,
        subject="MindCare – Verify your account",
        html_body=f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;
                    padding:20px;border:1px solid #eee;border-radius:10px;">
            <h2 style="color:#2c3e50;text-align:center;">Welcome to MindCare 💙</h2>

            <p style="font-size:15px;color:#444;">Hi <b>{username}</b>,</p>

            <p style="font-size:15px;color:#444;">
                Thanks for signing up! Please confirm your email address by pasting this code in MindCare.
            </p>

            <div style="text-align:center;margin:25px 0;">{token}</div>

            <hr style="margin:25px 0;border:none;border-top:1px solid #eee;" />

            <p style="font-size:12px;color:#999;text-align:center;">
                If you didn't create a MindCare account, you can safely ignore this email.
            </p>
        </div>
        """,
    )


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@router.post("/")
def create_user(body: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user and send a verification email."""
    try:
        # Normalise role to lowercase and validate
        role = body.role.lower()
        if role not in VALID_ROLES:
            return ResponseHelper.error(message="Invalid role. Must be 'user' or 'counselor'.")

        # Check for duplicate username / email
        existing_username = session.exec(
            select(Users).where(Users.username == body.username)
        ).first()
        if existing_username:
            return ResponseHelper.error(message="Username already taken.")

        existing_email = session.exec(
            select(Users).where(Users.email == body.email)
        ).first()
        if existing_email:
            return ResponseHelper.error(message="Email already registered.")

        # Build and persist the user row
        new_user = Users(
            userid=str(uuid.uuid4()),
            username=body.username,
            first_name=body.first_name,
            last_name=body.last_name,
            email=body.email,
            role=role,
            password=hash_password(body.password),
            isVerified=True,
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # # Send verification email (non-fatal if it fails)
        # err = send_verification_email(
        #     userid=new_user.userid,
        #     email=new_user.email,
        #     username=new_user.username,
        # )
        # if isinstance(err, Exception):
        #     return ResponseHelper.error(
        #         message="User registered but verification email could not be sent.",
        #         errors=str(err),
        #     )
            
        token = create_access_token({ "user_id": new_user.userid })    
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

    except Exception as e:
        session.rollback()
        return ResponseHelper.error(message=str(e))


@router.get("/verify")
def verify_user(token: str, session: Session = Depends(get_session)):
    """Activate a user account via the emailed token."""
    try:
        verify_data = get_valid_verification(token)
        if not verify_data:
            return ResponseHelper.error(message="Invalid or expired token.", status_code=400)

        if not check_rate_limit(verify_data.userid):
            return ResponseHelper.error(
                message="Too many verification attempts. Please try again later.",
                status_code=429,
            )

        user = session.exec(
            select(Users).where(Users.userid == verify_data.userid)
        ).first()
        if not user:
            return ResponseHelper.error(message="User not found.", status_code=404)

        if user.isVerified:
            return ResponseHelper.error(message="Account is already verified.")

        user.isVerified = True
        session.add(user)
        session.commit()

        activeVerifications.remove(verify_data)

        return ResponseHelper.success(message="Email verified successfully!")

    except Exception as e:
        session.rollback()
        return ResponseHelper.error(message=f"Internal server error: {str(e)}", status_code=500)


@router.post("/send-verification")
def send_verification(ctx: Context = Depends(get_context_unverified)):
    """Re-send the verification email for the currently authenticated (unverified) user."""
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()

        if user is None:
            return ctx.response.error(message="User not found.")
        if user.isVerified:
            return ctx.response.error(message="Account is already verified.")
        if not check_email_rate_limit(user.userid):
            return ctx.response.error(
                message="Too many email requests. Please try again later.",
                status_code=429,
            )

        err = send_verification_email(
            userid=user.userid,
            email=user.email,
            username=user.username,
        )
        if isinstance(err, Exception):
            return ctx.response.error(
                message="Verification email could not be sent.",
                errors=str(err),
            )

        return ctx.response.success(message="Verification email sent successfully!")

    except Exception as e:
        return ctx.response.error(message="Failed to send verification email.", errors=str(e))
