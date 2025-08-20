import './styles/index.css'

export * from './components'
export * from './consentHooks'
export * from './hooks'
export * from './themes'
export { getLocalizedCookieText } from './functions'

export type {
    CookieBannerTheme,
    CookieConsentBannerConfig,
    CookieProviderConfig as CookieProvider,
    SupportedLanguage,
    ConsentHook,
    ConsentHookContext,
    ConsentHookType,
    CookieCategory
} from './types'
