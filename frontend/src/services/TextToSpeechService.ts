import ApiService from './ApiService';
import { AxiosRequestConfig } from 'axios';

// This function sends text to your backend TTS endpoint and expects a streaming audio response
export async function apiTextToSpeechStream(text: string, config?: AxiosRequestConfig) {
    return ApiService.fetchData<ArrayBuffer>({
        url: 'gemini/ask', // FastAPI endpoint
        method: 'post',
        data: { text },
        responseType: 'arraybuffer', 
        ...config,
    });
}