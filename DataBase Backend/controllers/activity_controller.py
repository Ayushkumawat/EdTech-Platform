import time
import requests
from fastapi import APIRouter, Depends, HTTPException, Query, status

from config import settings
from dependencies import get_current_user

activity_router = APIRouter()

YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"


# ── helpers ────────────────────────────────────────────────────────────────────

def _search_videos(query: str, max_results: int = 15) -> list[str]:
    """Return a list of video IDs matching *query*."""
    key = (settings.youtube_api_key or "").strip()
    if not key:
        return []
    params = {
        "part": "id,snippet",
        "q": query,
        "maxResults": max_results,
        "type": "video",
        "key": key,
    }
    try:
        res = requests.get(f"{YOUTUBE_BASE_URL}/search", params=params, timeout=10)
        res.raise_for_status()
        return [item["id"]["videoId"] for item in res.json().get("items", [])]
    except Exception:
        return []


def _get_video_details(video_ids: list[str]) -> list[dict]:
    """Batch-fetch snippet + statistics for a list of video IDs."""
    key = (settings.youtube_api_key or "").strip()
    if not video_ids or not key:
        return []
    params = {
        "part": "snippet,statistics",
        "id": ",".join(video_ids),
        "key": key,
    }
    try:
        res = requests.get(f"{YOUTUBE_BASE_URL}/videos", params=params, timeout=10)
        res.raise_for_status()
        return res.json().get("items", [])
    except Exception:
        return []


def _is_relevant(title: str) -> bool:
    keywords = [
        "experiment", "activity", "animation", "demonstration",
        "practical", "reaction", "lab", "science", "explainer",
        "how", "what", "why",
    ]
    title_lower = title.lower()
    return any(k in title_lower for k in keywords)


def _build_video_card(item: dict) -> dict:
    vid_id = item["id"]
    snippet = item.get("snippet", {})
    thumbnails = snippet.get("thumbnails", {})
    thumbnail = (
        thumbnails.get("medium", {}).get("url")
        or thumbnails.get("default", {}).get("url")
        or ""
    )
    return {
        "title": snippet.get("title", ""),
        "channel": snippet.get("channelTitle", ""),
        "url": f"https://www.youtube.com/watch?v={vid_id}",
        "thumbnail": thumbnail,
    }


def fetch_activity_videos(topic: str, max_results: int = 5) -> list[dict]:
    """Main pipeline: search → details → filter → top N cards."""
    queries = [
        f"{topic} experiment",
        f"{topic} animation",
        f"{topic} demonstration",
    ]

    video_ids: set[str] = set()
    for q in queries[:2]:           # 2 queries keeps YouTube quota low
        video_ids.update(_search_videos(q, max_results=20))
        time.sleep(0.3)

    if not video_ids:
        return []

    details = _get_video_details(list(video_ids))

    cards = []
    for item in details:
        title = item.get("snippet", {}).get("title", "")
        if _is_relevant(title):
            cards.append(_build_video_card(item))

    # Sort by view count descending and cap at max_results
    def _views(c: dict) -> int:
        return 0  # statistics not fetched; order as returned

    return cards[:max_results]


# ── route ──────────────────────────────────────────────────────────────────────

@activity_router.get("/videos", status_code=status.HTTP_200_OK)
async def get_activity_videos(
    topic: str = Query(..., description="Activity or experiment topic to search for"),
    max_results: int = Query(default=5, ge=1, le=10),
    current_user=Depends(get_current_user),
):
    """
    Search YouTube for educational videos related to a lesson activity.
    Called by the frontend when Gemini's function-calling tool fires.
    """
    if not (settings.youtube_api_key or "").strip():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="YouTube API key is not configured on the server (set YOUTUBE_API_KEY in .env).",
        )

    videos = fetch_activity_videos(topic, max_results=max_results)

    return {"topic": topic, "videos": videos}
