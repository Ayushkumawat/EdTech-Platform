export type AppConfig = {
    apiPrefix: string
    apiPrefix1:string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    googleClientId: string
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    apiPrefix1:'https://edtech-platform-6dw3.onrender.com/api/v1/',
    authenticatedEntryPath: 'app/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '421969447253-4ph117jikerj89nc476hdq73trslklo2.apps.googleusercontent.com',
}

export default appConfig
