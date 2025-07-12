export type AppConfig = {
    apiPrefix: string
    apiPrefix1:string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    apiPrefix1:'https://7eca8fadb931.ngrok-free.app/api/v1/',
    authenticatedEntryPath: 'app/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
}

export default appConfig
