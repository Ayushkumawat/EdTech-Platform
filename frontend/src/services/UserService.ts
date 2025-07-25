import ApiService from './ApiService'

export type UpdateUserRequest = {
    first_name: string
    last_name: string
    class_id: string
}

export type UpdateUserResponse = {
    message: string
    user: {
        id: string
        first_name: string
        last_name: string
        email: string
        class_id: string
        avatar?: string
        created_at: string
        updated_at: string
    }
}

export async function apiUpdateUser<T>(data: UpdateUserRequest) {
    return ApiService.fetchData<T>({
        url: '/users/',
        method: 'put',
        data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
}

export async function apiGetUserProfile<T>() {
    return ApiService.fetchData<T>({
        url: '/users/profile',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
}

export async function apiGetUserMe<T>() {
    return ApiService.fetchData<T>({
        url: '/users/me',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    })
}
