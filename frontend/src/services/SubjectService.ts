import ApiService from './ApiService'

export async function apiGetSubjects<T>() {
    return ApiService.fetchData<T>({
        url: 'subjects/',
        method: 'get',
    })
}

export async function apiGetSubjectDetail<T>(subjectId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}`,
        method: 'get',
    });
}

export async function apiGetUserSubjects<T>() {
    return ApiService.fetchData<T>({
        url: 'subjects/user',
        method: 'get',
    })
}

export async function apiGetSubjectLessons<T>(subjectId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}/lessons`,
        method: 'get',
    });
}

export async function apiGetSubjectBooks<T>(subjectId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}/books`,
        method: 'get',
    });
}

export async function apiGetSubjectTeachers<T>(subjectId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}/teachers`,
        method: 'get',
    });
}

export async function apiCreateSubject<T>(subjectData: any) {
    return ApiService.fetchData<T>({
        url: 'subjects/',
        method: 'post',
        data: subjectData,
    })
}

export async function apiUpdateSubject<T>(subjectId: string, subjectData: any) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}`,
        method: 'put',
        data: subjectData,
    })
}

export async function apiDeleteSubject<T>(subjectId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}`,
        method: 'delete',
    })
}

export async function apiAssignSubjectToClass<T>(subjectId: string, classId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}/assign-class/${classId}`,
        method: 'post',
    })
}

export async function apiRemoveSubjectFromClass<T>(subjectId: string, classId: string) {
    return ApiService.fetchData<T>({
        url: `subjects/${subjectId}/remove-class/${classId}`,
        method: 'delete',
    })
}
