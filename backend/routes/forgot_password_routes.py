from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from db import get_session
from models.user import Users
from models.password_reset import PasswordReset
from utils.hash import hash_password
from utils.send_email import send_email
from utils.responses import ResponseHelper
from starlette import status
from datetime import datetime, timedelta
import random
import string



router = APIRouter(prefix="/api/forgot-password", tags=["Forgot Password"])


def generate_code(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))


# ── Step 1: Request reset code ──────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("")
def request_reset(request: ForgotPasswordRequest, session: Session = Depends(get_session)):
    user = session.exec(select(Users).where(Users.email == request.email)).first()

    # Always return success to avoid email enumeration
    if user is None:
        return ResponseHelper.success(message="If that email exists, a reset code has been sent.")

    # Invalidate any previous unused codes for this email
    old_codes = session.exec(
        select(PasswordReset)
        .where(PasswordReset.email == request.email)
        .where(PasswordReset.is_used == False)
    ).all()
    for old in old_codes:
        old.is_used = True
        session.add(old)

    # Create new code
    code = generate_code()
    reset_entry = PasswordReset(email=request.email, code=code)
    session.add(reset_entry)
    session.commit()

    # Send email — check for failure
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #980194;">Reset your password</h2>
        <p style="color: #444;">
            Use the code below to reset your MindCare password.
            It expires in <strong>15 minutes</strong>.
        </p>
        <div style="
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #980194;
            background: #f9f0ff;
            border-radius: 12px;
            padding: 20px 32px;
            text-align: center;
            margin: 24px 0;
        ">{code}</div>
        <p style="color: #888; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
        </p>
    </div>
    """

    result = send_email(request.email, "Your MindCare password reset code", html_body)

    if isinstance(result, Exception):
        return ResponseHelper.error(
            message="Failed to send email. Please try again.",
            errors=str(result)
        )

    return ResponseHelper.success(message="If that email exists, a reset code has been sent.")


# ── Step 2: Verify code ──────────────────────────────────────────────────────
class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


@router.post("/verify-code")
def verify_code(request: VerifyCodeRequest, session: Session = Depends(get_session)):
    entry = session.exec(
        select(PasswordReset)
        .where(PasswordReset.email == request.email)
        .where(PasswordReset.code == request.code)
        .where(PasswordReset.is_used == False)
        .order_by(PasswordReset.created_at.desc())
    ).first()

    if entry is None:
        return ResponseHelper.error(
            message="Invalid or expired code.",
        )

    # Check 15-minute expiry
    if datetime.utcnow() > entry.created_at + timedelta(minutes=15):
        entry.is_used = True
        session.add(entry)
        session.commit()
        return ResponseHelper.error(
            message="Code has expired. Please request a new one.",
        )

    return ResponseHelper.success(message="Code verified.")


# ── Step 3: Reset password ───────────────────────────────────────────────────
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    password: str


@router.post("/reset")
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)):
    entry = session.exec(
        select(PasswordReset)
        .where(PasswordReset.email == request.email)
        .where(PasswordReset.code == request.code)
        .where(PasswordReset.is_used == False)
        .order_by(PasswordReset.created_at.desc())
    ).first()

    if entry is None:
        return ResponseHelper.error(message="Invalid or expired code.")

    if datetime.utcnow() > entry.created_at + timedelta(minutes=15):
        entry.is_used = True
        session.add(entry)
        session.commit()
        return ResponseHelper.error(message="Code has expired. Please request a new one.")

    user = session.exec(select(Users).where(Users.email == request.email)).first()
    if user is None:
        return ResponseHelper.error(message="User not found.")

    # Update password and mark code as used
    user.password = hash_password(request.password)
    entry.is_used = True

    session.add(user)
    session.add(entry)
    session.commit()

    return ResponseHelper.success(message="Password reset successfully.")