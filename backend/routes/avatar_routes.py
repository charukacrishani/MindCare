from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import select
from context import Context, get_context
from models.user import DoctorInformation, Users

router = APIRouter(prefix="/api/avatar", tags=["Avatar"])


@router.post("/upload")
async def upload_avatar(file: UploadFile = File(...), ctx: Context = Depends(get_context)):
    """Upload avatar for counselor"""
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.role != "counselor":
            raise HTTPException(status_code=403, detail="Only counselors can upload avatars")
        
        # Read file content as bytes
        content = await file.read()
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        # Validate file type
        allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {allowed_types}")
        
        # Get or create doctor information
        doctor_info = ctx.db.exec(
            select(DoctorInformation).where(DoctorInformation.userid == user.userid)
        ).first()
        
        if doctor_info is None:
            doctor_info = DoctorInformation(userid=user.userid)
        
        doctor_info.avatar = content
        ctx.db.add(doctor_info)
        ctx.db.commit()
        
        return ctx.response.success(message="Avatar uploaded successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        ctx.db.rollback()
        return ctx.response.error(message=str(e))


@router.get("/download/{userid}")
async def download_avatar(userid: str, ctx: Context = Depends(get_context)):
    """Download avatar for a counselor"""
    try:
        doctor_info = ctx.db.exec(
            select(DoctorInformation).where(DoctorInformation.userid == userid)
        ).first()
        
        if doctor_info is None or doctor_info.avatar is None:
            raise HTTPException(status_code=404, detail="Avatar not found")
        
        import base64
        avatar_base64 = base64.b64encode(doctor_info.avatar).decode("utf-8")
        
        return ctx.response.success(
            message="Avatar retrieved",
            data={"avatar": avatar_base64}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        return ctx.response.error(message=str(e))
