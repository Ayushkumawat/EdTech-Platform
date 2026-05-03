import ApiService from './ApiService'

export type VideoCard = {
    title: string
    url: string
    thumbnail: string
    channel: string
}

export type ActivityVideosResponse = {
    topic: string
    videos: VideoCard[]
}

export async function apiGetActivityVideos(topic: string, maxResults = 5) {
    return ApiService.fetchData<ActivityVideosResponse>({
        url: `activities/videos?topic=${encodeURIComponent(topic)}&max_results=${maxResults}`,
        method: 'get',
    })
}
