from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import select, Session

from context import Context, get_context
from models.user import Users
from fastapi import Body

from routes.doctor.doctor_info import get_doctor_info_by_id

router = APIRouter(prefix="/api/user", tags=["Users"])


def get_user_by_id(userid: str, ctx: Context) -> Users | None:
    query = select(Users).where(Users.userid == userid)
    return ctx.db.exec(query).first()

@router.get("/me")
def get_user_self(
    ctx: Context = Depends(get_context)
):
    try:
        requesting_user = get_user_by_id(ctx.user.user_id, ctx)
        if requesting_user is None:
            return ctx.response.error(message='Requesting user not found')
        if requesting_user.role == 'counselor':
            doctorInfo = get_doctor_info_by_id(requesting_user.userid, ctx)
            if doctorInfo is not None:
                requesting_user.first_name = doctorInfo.full_name

        return ctx.response.success(message='User retrieved', data=ctx.serialize(requesting_user))

    except Exception as e:
        return ctx.response.error(message=str(e))


@router.get("/")
def get_user(
    userid: str,
    ctx: Context = Depends(get_context)
):
    try:

        requesting_user = get_user_by_id(ctx.user.user_id, ctx)
        if requesting_user is None:
            return ctx.response.error(message='Requesting user not found')
        if requesting_user.role == 'user':
            return ctx.response.error(message='Permission denied')

        user = get_user_by_id(userid, ctx)
        if user is None:
            return ctx.response.error(message='User not found')

        return ctx.response.success(message='User retrieved', data=ctx.serialize(user))

    except Exception as e:
        return ctx.response.error(message=str(e))


@router.delete("/")
def delete_user(userid: str, ctx: Context = Depends(get_context)):
    try:
        requesting_user = get_user_by_id(ctx.user.user_id, ctx)
        if requesting_user is None:
            return ctx.response.error(message='Requesting user not found')
        if requesting_user.userid != userid:
            return ctx.response.error(message='Permission denied')

        user_to_delete = get_user_by_id(userid, ctx)
        if user_to_delete is None:
            return ctx.response.error(message='User not found')

        ctx.db.delete(user_to_delete)
        ctx.db.commit()

        return ctx.response.success(message=f'User {userid} deleted successfully')

    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message=str(e))



@router.put("/")
def update_user(
    userid: str,
    ctx: Context = Depends(get_context),
    update_data: dict = Body(...)
):
    """
    Update a user's information.
    - Only admins (role != 'user') can update other users.
    - `update_data` should be a JSON object with the fields to update.
    """
    try:
        requesting_user = get_user_by_id(ctx.user.user_id, ctx)
        if requesting_user is None:
            return ctx.response.error(message="Requesting user not found")
        if requesting_user.role == 'user':
            return ctx.response.error(message="Permission denied")

        user_to_update = get_user_by_id(userid, ctx)
        if user_to_update is None:
            return ctx.response.error(message="User not found")

        for key, value in update_data.items():
            if hasattr(user_to_update, key):
                setattr(user_to_update, key, value)

        ctx.db.add(user_to_update)
        ctx.db.commit()
        ctx.db.refresh(user_to_update)

        return ctx.response.success(
            message=f"User {userid} updated successfully",
            data=ctx.serialize(user_to_update)
        )

    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message=str(e))
