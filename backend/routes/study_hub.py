import os

from fastapi import APIRouter, Depends

from context import Context, get_context
from utils.youtube_vids import search_youtube


router = APIRouter(prefix="/api/study-hub", tags=["Study Hub"])

@router.get("/videos")
def get_study_hub_videos(ctx: Context = Depends(get_context)):
    results = search_youtube("mental health self-care techniques", max_results=5)
    return ctx.response.success(data=[r.__dict__ for r in results])
    
@router.get("/resources")
def get_study_hub_resources(ctx: Context = Depends(get_context)):
    resources_folder = "resources"
    resources = []
    try:
        for filename in os.listdir(resources_folder):
            if filename.endswith(".pdf") or filename.endswith(".txt"):
                resources.append(filename)
    except Exception as e:
        return ctx.response.error(message="Failed to load resources", errors=str(e))
    return ctx.response.success(data=resources)

@router.get("/resources/{filename}")
def get_study_hub_resource(filename: str, ctx: Context = Depends(get_context)):
    resource_path = os.path.join("resources", filename)
    if not os.path.exists(resource_path):
        return ctx.response.error(message="Resource not found")
    return ctx.response.success(data={"path": resource_path})