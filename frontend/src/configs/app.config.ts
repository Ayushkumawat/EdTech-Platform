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
    apiPrefix1:'https://a361-2405-201-301c-e80c-e125-7bd8-2e16-f476.ngrok-free.app/api/v1/',
    authenticatedEntryPath: 'app/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
}

export default appConfig
