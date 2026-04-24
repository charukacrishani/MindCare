from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import select
from context import Context, get_context
from models.user import Avatar, Users

router = APIRouter(prefix="/api/avatar", tags=["Avatar"])


@router.post("/upload")
async def upload_avatar(file: UploadFile = File(...), ctx: Context = Depends(get_context)):
    """Upload avatar for counselor"""
    try:
        user = ctx.db.exec(select(Users).where(Users.userid == ctx.user.user_id)).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        content = await file.read()
        
        max_size = 5 * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        # Validate file type
        allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {allowed_types}")

        set_avatar(user.userid, content, ctx)
        
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
        avatar_base64 = get_avatar(userid, ctx)
        
        return ctx.response.success(
            message="Avatar retrieved",
            data={"avatar": avatar_base64}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        return ctx.response.error(message=str(e))


def get_avatar(userid: str, ctx: Context) -> Optional[str]:
    """Helper function to get avatar as base64 string"""
    avatar = ctx.db.exec(
        select(Avatar).where(Avatar.userid == userid)
    ).first()
    
    if avatar and avatar.image_data:
        return avatar.get_image_base64()
    
    return None

def set_avatar(userid: str, image_bytes: bytes, ctx: Context):
    """Helper function to set avatar from bytes"""
    avatar = ctx.db.exec(
        select(Avatar).where(Avatar.userid == userid)
    ).first()
    
    if avatar is None:
        avatar = Avatar(userid=userid)
    
    avatar.set_image(image_bytes)
    ctx.db.add(avatar)
    ctx.db.commit()