import ApiService from './ApiService'

export interface UsageStatusResponse {
  Status: string
  message?: string
  remainingTokens?: number
  totalTokens?: number
  lastUsed?: string
}

export interface UsageStatusRequest {
  tokenCount: number
}

export async function apiGetUsageStatus<T>(tokenCount: number) {
  return ApiService.fetchData<T>({
    url: `users/user_token_status/${tokenCount}`,
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    }
  })
}

export async function apiIsTokenActive(tokenCount: number): Promise<boolean> {
  try {
    const response = await apiGetUsageStatus<UsageStatusResponse>(tokenCount)
    return response.data.Status === 'Active'
  } catch (error) {
    console.error('Error checking token status:', error)
    return false
  }
}
