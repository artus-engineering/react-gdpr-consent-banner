export * from './components'
export {
    /**
     * @deprecated Use the declarative `integrations` config (see `IntegrationRegistry`)
     * instead. Consent hooks remain functional throughout 2.x and will be removed in 3.0.
     */
    ConsentHookManager,
    createCookieUtils,
    createCustomToolHook,
    createFacebookPixelHook,
    createGoogleAdsHook,
    createGoogleAnalyticsHook,
    createGoogleTagManagerHook,
    createGranularGoogleTagManagerHook
} from './consentHooks'
export {
    type ConsentCookiePayload,
    type ConsentDecisions,
    type ConsentStateConfig,
    type ConsentStatus,
    getConsentStatus,
    readConsentCookie,
    refreshConsentCookie,
    resolveConsentCookieName,
    resolvePurposesHashPrefix
} from './consentState'
export { getLocalizedCookieText } from './functions'
export * from './hooks'
export {
    type CustomScriptIntegration,
    type Ga4Integration,
    type GoogleAdsIntegration,
    type GtmIntegration,
    type IntegrationDescriptor,
    IntegrationRegistry,
    type IntegrationType,
    type MetaPixelIntegration
} from './integrations'
export { type ConsentSnapshot, type ConsentStatusKind, ConsentStore } from './store'
export * from './themes'

export type {
    CookieBannerTheme,
    CookieCategory,
    CookieConsentBannerConfig,
    CookieProviderConfig as CookieProvider,
    PartialCookieConsentLabels,
    SupportedLanguage
} from './types'

/**
 * @deprecated Use the declarative `integrations` config instead. Consent hooks
 * remain functional throughout 2.x and will be removed in 3.0.
 */
export type ConsentHook = import('./types').ConsentHook
/**
 * @deprecated Use the declarative `integrations` config instead.
 */
export type ConsentHookContext = import('./types').ConsentHookContext
/**
 * @deprecated Use the declarative `integrations` config instead. Consent hooks
 * remain functional throughout 2.x and will be removed in 3.0.
 */
export type ConsentHookType = import('./types').ConsentHookType
