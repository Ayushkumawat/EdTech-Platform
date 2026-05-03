import requests
from isodate import parse_duration
import json
import time

API_KEY = "YOUR_YOUTUBE_API_KEY"
BASE_URL = "https://www.googleapis.com/youtube/v3"

# -----------------------------
# 1. QUERY GENERATION
# -----------------------------
def generate_queries(topic):
    base = topic.lower()

    return [
        f"{base} experiment",
        f"{base} animation",
        f"{base} demonstration",
        f"{base} explanation",
        f"{base} practical",
        f"{base} chemistry animation",
        f"{base} class 10 explanation",
        f"{base} 3d animation",
    ]


# -----------------------------
# 2. SEARCH (LIMITED)
# -----------------------------
def search_videos(query, max_results=25):
    url = f"{BASE_URL}/search"

    params = {
        "part": "id,snippet",
        "q": query,
        "maxResults": max_results,
        "type": "video",
        "key": API_KEY
    }

    res = requests.get(url, params=params)
    return res.json()


# -----------------------------
# 3. GET VIDEO DETAILS (BATCH)
# -----------------------------
def get_video_details(video_ids):
    url = f"{BASE_URL}/videos"

    params = {
        "part": "contentDetails,snippet,statistics",
        "id": ",".join(video_ids),
        "key": API_KEY
    }

    res = requests.get(url, params=params)
    return res.json()


# -----------------------------
# 4. FILTERS
# -----------------------------
def is_relevant(title):
    keywords = [
        "experiment", "activity", "animation",
        "demonstration", "practical", "reaction",
        "lab", "science"
    ]

    title = title.lower()
    return any(k in title for k in keywords)


def is_short(duration_iso):
    seconds = parse_duration(duration_iso).total_seconds()
    return seconds <= 60


# -----------------------------
# 5. MAIN PIPELINE
# -----------------------------
def get_educational_shorts(topic):
    queries = generate_queries(topic)

    video_ids = set()

    print("\n🔍 Running smart searches...\n")

    # 🔥 LIMIT SEARCH CALLS (IMPORTANT)
    for q in queries[:3]:   # only 3 queries → saves quota
        print(f"Query: {q}")
        data = search_videos(q)

        for item in data.get("items", []):
            video_ids.add(item["id"]["videoId"])

        time.sleep(1)  # avoid rate issues

    print(f"\nCollected {len(video_ids)} unique videos")

    # 🔥 BATCH DETAILS FETCH
    video_ids = list(video_ids)
    details = get_video_details(video_ids)

    results = []

    print("\n🎯 Filtering Shorts...\n")

    for item in details.get("items", []):
        title = item["snippet"]["title"]
        duration = item["contentDetails"]["duration"]

        if is_short(duration) and is_relevant(title):
            video_id = item["id"]

            results.append({
                "title": title,
                "channel": item["snippet"]["channelTitle"],
                "views": int(item["statistics"].get("viewCount", 0)),
                "url": f"https://www.youtube.com/shorts/{video_id}"
            })

    return results


# -----------------------------
# 6. SAVE RESULTS
# -----------------------------
def save_results(data, filename="shorts.json"):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)


# -----------------------------
# 7. RUN
# -----------------------------
if __name__ == "__main__":
    topic = input("Enter topic: ")

    shorts = get_educational_shorts(topic)

    print(f"\n✅ Found {len(shorts)} relevant Shorts:\n")

    for i, vid in enumerate(shorts, 1):
        print(f"{i}. {vid['title']}")
        print(f"   {vid['url']} ({vid['views']} views)\n")

    save_results(shorts)
    print("\n💾 Saved to shorts.json")