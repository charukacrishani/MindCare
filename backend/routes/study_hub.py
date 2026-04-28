from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlmodel import select
from pathlib import Path

from context import Context, get_context
from models.resources import Resources
from utils.youtube_vids import search_youtube


router = APIRouter(prefix="/api/study-hub", tags=["Study Hub"])

@router.get("/videos")
def get_study_hub_videos(ctx: Context = Depends(get_context)):
    results = search_youtube("mental health self-care techniques", max_results=10)
    return ctx.response.success(data=[r.__dict__ for r in results])
    
@router.get("/resources")
def get_study_hub_resources(ctx: Context = Depends(get_context)):
    query = select(Resources)
    availability = ctx.db.exec(query).all()
    return ctx.response.success(data=[a.__dict__ for a in availability])

@router.get("/resources/{id}")
def get_study_hub_resource(id: int, ctx: Context = Depends(get_context)):
    query = select(Resources).where(Resources.id == id)
    resource = ctx.db.exec(query).first()
    if not resource:
        return ctx.response.error(message="Resource not found")
    resource_path = Path(__file__).resolve().parent.parent / "resources" / f"{resource.id}.pdf"
    if not resource_path.exists():
        return ctx.response.error(message="Resource not found")
    return FileResponse(path=str(resource_path), filename=resource.title)