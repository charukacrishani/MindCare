import base64

from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.doctor_v_patient import DoctorReview
from models.user import Avatar, DoctorInformation, Users
from routes.avatar.avatar_routes import get_avatar


router = APIRouter(prefix="/api/doctor", tags=["Doctors"])

@router.get("/list")
def get_doctors_list(ctx: Context = Depends(get_context)):
    try:
        query = (
            select(DoctorInformation, Avatar)
            .join(Avatar, Avatar.userid == DoctorInformation.userid, isouter=True)
            .where(DoctorInformation.licence_number != None)
            .where(DoctorInformation.available == True)
        )

        results = ctx.db.exec(query).all()
        
        data = []
        for doctor, avatar in results:
            doc_dict = ctx.serialize(doctor, exclude=["password"])
            doc_dict["avatar"] = (
                base64.b64encode(avatar.image_data).decode("utf-8")
                if avatar and avatar.image_data
                else None
            )
            data.append(doc_dict)

        return ctx.response.success(message="success", data=data)
    except Exception as e:
        return ctx.response.error(message='failed to get doctors list', errors=str(e))


@router.get("/{doctor_id}")
def get_doctor_profile(doctor_id: str, ctx: Context = Depends(get_context)):
    try:
        doctor_profile = ctx.db.exec(
            select(DoctorInformation).where(DoctorInformation.userid == doctor_id)
        ).first()
        doctor_user = ctx.db.exec(
            select(Users).where(Users.userid == doctor_id)
        ).first()

        if doctor_profile is None and doctor_user is None:
            return ctx.response.error(message="Doctor not found")

        reviews_query = (
            select(DoctorReview, Users, Avatar)
            .join(Users, Users.userid == DoctorReview.patient_id)
            .join(Avatar, Avatar.userid == Users.userid, isouter=True)
            .where(DoctorReview.doctor_id == doctor_id)
            .order_by(DoctorReview.created_at.desc())
        )
        review_rows = ctx.db.exec(reviews_query).all()

        reviews = []
        ratings = []
        for review, patient, avatar in review_rows:
            review_data = ctx.serialize(review)
            patient_name = f"{patient.first_name} {patient.last_name}".strip()

            review_data["patient_name"] = patient_name or patient.username
            review_data["patient_avatar"] = (
                base64.b64encode(avatar.image_data).decode("utf-8")
                if avatar and avatar.image_data
                else None
            )
            reviews.append(review_data)
            ratings.append(review.rating)

        profile_data = ctx.serialize(doctor_profile) if doctor_profile else {}
        profile_data["userid"] = doctor_id
        profile_data["display_name"] = (
            doctor_profile.full_name
            if doctor_profile and doctor_profile.full_name
            else (
                f"{doctor_user.first_name} {doctor_user.last_name}".strip()
                if doctor_user
                else "Unknown Doctor"
            )
        )
        profile_data["avatar"] = get_avatar(doctor_id, ctx)
        profile_data["average_rating"] = round(sum(ratings) / len(ratings), 1) if ratings else None
        profile_data["review_count"] = len(reviews)

        return ctx.response.success(
            message="Doctor profile retrieved",
            data={
                "doctor": profile_data,
                "reviews": reviews,
            },
        )
    except Exception as e:
        return ctx.response.error(message="failed to get doctor profile", errors=str(e))
