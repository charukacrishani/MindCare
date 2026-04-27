import os
import requests

class VideoResult:
    title: str
    channel: str
    url: str
    thumbnail: str
    published: str

API_KEY = os.getenv("GOOGLE_API_KEY")  # Ensure

def search_youtube(query, max_results=5) -> list[VideoResult]:
    url = "https://www.googleapis.com/youtube/v3/search"
    
    params = {
        "key": API_KEY,
        "q": query,
        "part": "snippet",
        "type": "video",          # ensures only videos
        "maxResults": max_results,
        "safeSearch": "strict"    # good for general/public apps
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()  # raises error if request fails

    data = response.json()

    results = []
    for item in data.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]

        results.append(VideoResult(
            title=snippet["title"],
            channel=snippet["channelTitle"],
            url=f"https://www.youtube.com/watch?v={video_id}",
            thumbnail=snippet["thumbnails"]["medium"]["url"],
            published=snippet["publishedAt"]
        ))

    return results