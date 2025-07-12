import ApiService from './ApiService';

export async function apiAskGemini<T>(payload: any) {
    return ApiService.fetchData<T>({
        url: 'gemini/ask',
        method: 'post',
        data: payload,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

export async function apiAskGeminiImage<T>(payload: any) {
    return ApiService.fetchData<T>({
        url: 'gemini/ask-image',
        method: 'post',
        data: payload,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}
