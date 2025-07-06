import ApiService from './ApiService'

export async function apiGetBooks<T>() {
    return ApiService.fetchData<T>({
        url: 'books/',
        method: 'get',
    })
}

export async function apiGetSubjectBookByClass<T>(classId: string) {
    return ApiService.fetchData<T>({
        url: `classes/${classId}`,
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
        }
    })
}

export async function apiGetBookDetail<T>(bookId: string) {
    return ApiService.fetchData<T>({
        url: `books/${bookId}`, // Assuming the API follows RESTful conventions
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
        }
    });
}

export async function apiGetPurchasedBooks<T>() {
    return ApiService.fetchData<T>({
        url: 'bookpurchase/user',
        method: 'get',
    })
}

export async function apiGetPurchasedBookDetail<T>(bookId: string) {
    return ApiService.fetchData<T>({
        url: `bookpurchase/${bookId}`, 
        method: 'get',
    });
}

export async function apiPostPurchasedBook<T>(bookId: string) {
    return ApiService.fetchData<T>({
        url: `bookpurchase/${bookId}`,
        method: 'post',
    })
}

export async function apiGetLessonContent<T>(lessonId: string) {
    return ApiService.fetchData<T>({
        url: `lessons/user/${lessonId}`, 
        method: 'get',
    });
}