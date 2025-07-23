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

// Fetch chapter progress details by chapter ID
export async function apiGetChapterProgress<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `chaptercompletions/${chapterId}`,
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
} 

export async function apiPutChapterProgress<T>(chapterProgessData:any) {
    return ApiService.fetchData<T>({
        url: `chaptercompletions/${chapterProgessData.uid}`,
        method: 'put',
        data: chapterProgessData,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
} 

