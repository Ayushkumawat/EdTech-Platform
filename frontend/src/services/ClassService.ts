import ApiService from './ApiService'
import axios from 'axios'
import appConfig from '@/configs/app.config'

export async function apiGetClasses<T>() {
    return ApiService.fetchData<T>({
        url: 'classes/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
        }
    })
}

// Public endpoint for getting classes without authentication
export async function apiGetPublicClasses<T>() {
    try {
        const response = await axios.get<T>(`${appConfig.apiPrefix1}classes/`, {
            timeout: 10000, // Reduced timeout
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
            }
        })
        return response
    } catch (error: any) {
        console.error('apiGetPublicClasses error:', error);
        throw error;
    }
}

export async function apiGetClassDetail<T>(classId: string) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}`,
        method: 'get',
    });
}

export async function apiGetUserClasses<T>() {
    return ApiService.fetchData<T>({
        url: 'classes/user',
        method: 'get',
    })
}

export async function apiGetClassStudents<T>(classId: string) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}/students`,
        method: 'get',
    });
}

export async function apiGetClassSubjects<T>(classId: string) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}/subjects`,
        method: 'get',
    });
}

export async function apiCreateClass<T>(classData: any) {
    return ApiService.fetchData<T>({
        url: 'classes/',
        method: 'post',
        data: classData,
    })
}

export async function apiUpdateClass<T>(classId: string, classData: any) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}`,
        method: 'put',
        data: classData,
    })
}

export async function apiDeleteClass<T>(classId: string) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}`,
        method: 'delete',
    })
}
