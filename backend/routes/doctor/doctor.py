import base64

from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.user import Avatar, DoctorInformation, Users


router = APIRouter(prefix="/api/doctor", tags=["Doctors"])

@router.get("/list")
def get_doctors_list(ctx: Context = Depends(get_context)):
    try:
        query = (
            select(DoctorInformation, Avatar)
            .join(Avatar, Avatar.userid == DoctorInformation.userid, isouter=True)
            .where(DoctorInformation.licence_number != None)
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
