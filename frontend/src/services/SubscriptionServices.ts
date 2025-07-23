import ApiService from './ApiService';

// Fetch all subscription plans
export async function apiGetAllSubscriptions<T>() {
    return ApiService.fetchData<T>({
        url: 'subscriptions/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

// Fetch subscription details by subscription ID
export async function apiGetSubscription<T>(subscriptionId: string) {
    return ApiService.fetchData<T>({
        url: `subscriptions/${subscriptionId}`,
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

// Create a new subscription
export async function apiCreateSubscription<T>(subscriptionData: any) {
    return ApiService.fetchData<T>({
        url: 'subscriptions',
        method: 'post',
        data: subscriptionData,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

// Update an existing subscription
export async function apiUpdateSubscription<T>(subscriptionId: string, subscriptionData: any) {
    return ApiService.fetchData<T>({
        url: `subscriptions/${subscriptionId}`,
        method: 'put',
        data: subscriptionData,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

// Cancel a subscription
export async function apiCancelSubscription<T>(subscriptionId: string) {
    return ApiService.fetchData<T>({
        url: `subscriptions/${subscriptionId}`,
        method: 'delete',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    });
} 