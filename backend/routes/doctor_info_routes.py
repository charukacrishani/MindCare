from fastapi import APIRouter, Depends, Query
from sqlmodel import select

from context import Context, get_context
from models.user import DoctorInformation


router = APIRouter(prefix="/api/doctor-info", tags=["Doctor Information"])


def get_doctor_info_by_id(userid: str, ctx: Context) -> DoctorInformation | None:
    query = select(DoctorInformation).where(DoctorInformation.userid == userid)
    return ctx.db.exec(query).first()


@router.get("/")
def get_user_information(
    userid: str = Query(..., description="User ID to fetch"),  # required
    ctx: Context = Depends(get_context)
):
    try:
        user_info = get_doctor_info_by_id(userid, ctx)
        if user_info is None:
            return ctx.response.error(message='doctor information not found')

        return ctx.response.success(message='Doctor info retrieved', data=ctx.serialize(user_info))

    except Exception as e:
        return ctx.response.error(message=str(e))