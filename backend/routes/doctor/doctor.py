from fastapi import APIRouter, Depends
from sqlmodel import select

from context import Context, get_context
from models.user import Users


router = APIRouter(prefix="/api/doctor", tags=["Doctors"])

@router.get("/list")
def get_doctors_list(ctx: Context = Depends(get_context)):
    try:
        query = select(Users).where(Users.role == 'doctor')
        doctors = ctx.db.exec(query).all()
        
        return ctx.response.success(message='success', data=ctx.serialize(doctors))
    except Exception as e:
        return ctx.response.error(message='failed to get doctors list', errors=str(e))
