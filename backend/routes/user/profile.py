from datetime import datetime
import json
import base64

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select

from context import Context, get_context
from models.user import Avatar, DoctorInformation, UserInformation, Users
from routes.avatar.avatar_routes import get_avatar, set_avatar
from routes.user import user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class UserProfileData(BaseModel):
    gender: str
    dob: str
    sexualOrientation: str
    maritalStatus: str
    occupation: str = ""
    avatar: str | None = None  # Base64 encoded avatar image


class CounselorProfileData(BaseModel):
    fullName: str
    gender: str
    dob: str
    specializations: list[str]
    yearsOfExperience: str
    licenceNumber: str
    avatar: str | None = None  # Base64 encoded avatar image


class ProfileSetupRequest(BaseModel):
    data: dict


class ProfileUpdateRequest(BaseModel):
    data: dict


def parse_dob(value: str) -> datetime:
    return datetime.fromisoformat(value)


def parse_specializations(value: str | None) -> list[str]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except json.JSONDecodeError:
        pass
    return [part.strip() for part in value.split(",") if part.strip()]


def serialize_user_profile(ctx: Context, profile: UserInformation, userid: str, avatar_base64: str | None = None) -> dict:
    serialized = ctx.serialize(profile)
    serialized.setdefault("userid", userid)
    serialized.setdefault("dob", None)
    serialized.setdefault("age", None)
    serialized.setdefault("gender", None)
    serialized.setdefault("sexual_orientation", None)
    serialized.setdefault("marital_status", None)
    serialized.setdefault("occupation", None)
    if avatar_base64:
        serialized["avatar"] = avatar_base64
    else:
        serialized["avatar"] = None
        
    return serialized


def serialize_counselor_profile(ctx: Context, profile: DoctorInformation, userid: str, avatar_base64: str | None = None) -> dict:
    serialized = ctx.serialize(profile)
    serialized.setdefault("userid", userid)
    serialized.setdefault("full_name", None)
    serialized.setdefault("dob", None)
    serialized.setdefault("age", None)
    serialized.setdefault("gender", None)
    serialized.setdefault("licence_number", None)
    serialized.setdefault("years_of_experience", None)
    serialized["specializations"] = parse_specializations(serialized.get("specializations"))
    if avatar_base64:
        serialized["avatar"] = avatar_base64
    else:
        serialized["avatar"] = None
    
    return serialized


@router.get("/me")
def get_my_profile(ctx: Context = Depends(get_context)):
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()
        if user is None:
            return ctx.response.error(message="Requesting user not found")

        if user.role == "user":
            profile = ctx.db.exec(
                select(UserInformation).where(UserInformation.userid == user.userid)
            ).first()
            if profile is None:
                profile = UserInformation(userid=user.userid)
            
            avatar_base64 = get_avatar(user.userid, ctx)
            
            return ctx.response.success(
                message="Profile retrieved",
                data={
                    "role": "user",
                    "profile": serialize_user_profile(ctx, profile, user.userid, avatar_base64),
                },
            )

        if user.role == "counselor":
            profile = ctx.db.exec(
                select(DoctorInformation).where(DoctorInformation.userid == user.userid)
            ).first()
            if profile is None:
                profile = DoctorInformation(userid=user.userid)
            
            avatar_base64 = get_avatar(user.userid, ctx)

            return ctx.response.success(
                message="Profile retrieved",
                data={
                    "role": "counselor",
                    "profile": serialize_counselor_profile(ctx, profile, user.userid, avatar_base64),
                },
            )

        return ctx.response.error(message="Unsupported role")
    except Exception as e:
        return ctx.response.error(message=str(e))


@router.patch("/me")
def update_my_profile(body: ProfileUpdateRequest, ctx: Context = Depends(get_context)):
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()
        if user is None:
            return ctx.response.error(message="Requesting user not found")

        payload = body.data or {}

        if user.role == "user":
            profile = ctx.db.exec(
                select(UserInformation).where(UserInformation.userid == user.userid)
            ).first()
            if profile is None:
                profile = UserInformation(userid=user.userid)

            if "gender" in payload:
                profile.gender = str(payload.get("gender") or "").strip() or None

            if "dob" in payload:
                dob_raw = str(payload.get("dob") or "").strip()
                profile.dob = parse_dob(dob_raw) if dob_raw else None

            if "sexualOrientation" in payload:
                profile.sexual_orientation = str(payload.get("sexualOrientation") or "").strip() or None

            if "maritalStatus" in payload:
                profile.marital_status = str(payload.get("maritalStatus") or "").strip() or None

            if "occupation" in payload:
                profile.occupation = str(payload.get("occupation") or "").strip() or None
                
            if "avatar" in payload and payload.get("avatar"):
                set_avatar(user.userid, base64.b64decode(str(payload.get("avatar"))), ctx)

            profile.age = max(0, datetime.utcnow().year - profile.dob.year) if profile.dob else None
            ctx.db.add(profile)

            user.isComplete = True
            ctx.db.add(user)
            ctx.db.commit()
            ctx.db.refresh(profile)

            return ctx.response.success(
                message="Profile updated",
                data={
                    "role": "user",
                    "profile": serialize_user_profile(ctx, profile, user.userid, get_avatar(user.userid, ctx)),
                },
            )

        if user.role == "counselor":
            profile = ctx.db.exec(
                select(DoctorInformation).where(DoctorInformation.userid == user.userid)
            ).first()
            if profile is None:
                profile = DoctorInformation(userid=user.userid)

            if "fullName" in payload:
                profile.full_name = str(payload.get("fullName") or "").strip() or None

            if "gender" in payload:
                profile.gender = str(payload.get("gender") or "").strip() or None

            if "dob" in payload:
                dob_raw = str(payload.get("dob") or "").strip()
                profile.dob = parse_dob(dob_raw) if dob_raw else None

            if "licenceNumber" in payload:
                license_value = str(payload.get("licenceNumber") or "").strip() or None
                profile.licence_number = license_value
                profile.license_no = license_value

            if "yearsOfExperience" in payload:
                years_raw = str(payload.get("yearsOfExperience") or "").strip()
                profile.years_of_experience = int(years_raw) if years_raw else None

            if "specializations" in payload:
                incoming = payload.get("specializations")
                if isinstance(incoming, list):
                    specs = [str(item).strip() for item in incoming if str(item).strip()]
                elif isinstance(incoming, str):
                    specs = parse_specializations(incoming)
                else:
                    specs = []
                serialized_specs = json.dumps(specs)
                profile.specializations = serialized_specs
                profile.specialization = serialized_specs
            
            if "avatar" in payload and payload.get("avatar"):
                set_avatar(user.userid, base64.b64decode(str(payload.get("avatar"))), ctx)

            profile.age = max(0, datetime.utcnow().year - profile.dob.year) if profile.dob else None
            ctx.db.add(profile)

            user.isComplete = True
            ctx.db.add(user)
            ctx.db.commit()
            ctx.db.refresh(profile)

            return ctx.response.success(
                message="Profile updated",
                data={
                    "role": "counselor",
                    "profile": serialize_counselor_profile(ctx, profile, user.userid, get_avatar(user.userid, ctx)),
                },
            )

        return ctx.response.error(message="Unsupported role")

    except ValueError as e:
        ctx.db.rollback()
        return ctx.response.error(message="Invalid profile payload", errors=str(e))
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message=str(e))


@router.post("/setup")
def save_profile_setup(body: ProfileSetupRequest, ctx: Context = Depends(get_context)):
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()
        if user is None:
            return ctx.response.error(message="Requesting user not found")

        if user.role == "user":
            payload = UserProfileData.model_validate(body.data)
            row = ctx.db.exec(
                select(UserInformation).where(UserInformation.userid == user.userid)
            ).first()
            if row is None:
                row = UserInformation(userid=user.userid)

            row.gender = payload.gender
            row.dob = parse_dob(payload.dob)
            row.sexual_orientation = payload.sexualOrientation
            row.marital_status = payload.maritalStatus
            row.occupation = payload.occupation.strip() or None
            row.age = max(0, datetime.utcnow().year - row.dob.year) if row.dob else None
            # Handle avatar if provided (base64 encoded)
            if payload.avatar:
                set_avatar(user.userid, base64.b64decode(payload.avatar), ctx)

            ctx.db.add(row)

        elif user.role == "counselor":
            payload = CounselorProfileData.model_validate(body.data)
            row = ctx.db.exec(
                select(DoctorInformation).where(DoctorInformation.userid == user.userid)
            ).first()
            if row is None:
                row = DoctorInformation(userid=user.userid)

            row.full_name = payload.fullName.strip()
            row.gender = payload.gender
            row.dob = parse_dob(payload.dob)
            row.age = max(0, datetime.utcnow().year - row.dob.year) if row.dob else None
            row.licence_number = payload.licenceNumber.strip()
            row.license_no = row.licence_number
            years = payload.yearsOfExperience.strip()
            row.years_of_experience = int(years) if years else None

            serialized_specs = json.dumps(payload.specializations)
            row.specializations = serialized_specs
            row.specialization = serialized_specs
            
            # Handle avatar if provided (base64 encoded)
            if payload.avatar:
                set_avatar(user.userid, base64.b64decode(payload.avatar), ctx)

            ctx.db.add(row)
        else:
            return ctx.response.error(message="Unsupported role for profile setup")

        user.isComplete = True
        ctx.db.add(user)
        ctx.db.commit()

        return ctx.response.success(message="Profile setup saved")

    except ValueError as e:
        ctx.db.rollback()
        return ctx.response.error(message="Invalid profile payload", errors=str(e))
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message=str(e))
