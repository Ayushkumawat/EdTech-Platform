import ApiService from './ApiService';

// Fetch chapter content by chapter ID
export async function apiGetChapterContent<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `chapters/${chapterId}`,
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
} 