import os
import requests
from dataclasses import dataclass

@dataclass
class VideoResult:
    title: str
    channel: str
    url: str
    thumbnail: str
    published: str

API_KEY = os.getenv("GOOGLE_API_KEY")

def search_youtube(query: str, max_results: int = 10) -> list[VideoResult]:
    if not API_KEY:
        raise ValueError("Missing GOOGLE_API_KEY environment variable")

    url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "key": API_KEY,
        "q": query,
        "part": "snippet",
        "type": "video",
        "maxResults": max_results,
        "safeSearch": "strict"
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()

    results = []
    for item in data.get("items", []):
        video_id = item["id"].get("videoId")
        snippet = item.get("snippet", {})

        if not video_id:
            continue

        results.append(VideoResult(
            title=snippet.get("title", ""),
            channel=snippet.get("channelTitle", ""),
            url=f"https://www.youtube.com/watch?v={video_id}",
            thumbnail=snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            published=snippet.get("publishedAt", "")
        ))

    return results