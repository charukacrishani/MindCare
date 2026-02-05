from fastapi import APIRouter, Depends, Query
from sqlmodel import select

from context import Context, get_context
from models.user import UserInformation, Users

router = APIRouter(prefix="/api/user-info", tags=["User Information"])


def get_user_info_by_id(userid: str, ctx: Context) -> UserInformation | None:
    query = select(UserInformation).where(UserInformation.userid == userid)
    return ctx.db.exec(query).first()


def get_user_by_id(userid: str, ctx: Context) -> Users | None:
    query = select(Users).where(Users.userid == userid)
    return ctx.db.exec(query).first()


@router.get("/")
def get_user_information(
    userid: str = Query(..., description="User ID to fetch"),  # required
    ctx: Context = Depends(get_context)
):
    try:
        # Fetch the requesting user
        requesting_user = get_user_by_id(ctx.user.user_id, ctx)
        if requesting_user is None:
            return ctx.response.error(message='Requesting user not found')

        # Permission check:
        # - Admins can view anyone
        # - Doctors can view anyone
        # - Users can only view their own info
        if requesting_user.role == 'user' and requesting_user.userid != userid:
            return ctx.response.error(message='Permission denied')

        # Fetch the actual user info from UserInformation table
        user_info = get_user_info_by_id(userid, ctx)
        if user_info is None:
            return ctx.response.error(message='User information not found')

        return ctx.response.success(message='User info retrieved', data=ctx.serialize(user_info))

    except Exception as e:
        return ctx.response.error(message=str(e))
