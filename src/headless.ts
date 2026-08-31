/**
 * React-free entry point.
 *
 * The main barrel (`src/index.ts`) cannot be tree-shaken down to the consent
 * primitives: it re-exports components whose module scope calls `createContext`,
 * which bundlers must treat as a side effect, so importing `getConsentStatus`
 * from the barrel drags React into the output. Non-React consumers — the
 * platform's embed loader above all — import from here instead and get only the
 * cookie logic and the integration registry.
 */

export {
    type ConsentCookiePayload,
    type ConsentDecisions,
    type ConsentStateConfig,
    type ConsentStatus,
    consentStateConfigFrom,
    derivePurposesFingerprint,
    getConsentStatus,
    migrateLegacyConsentCookies,
    readConsentCookie,
    refreshConsentCookie,
    resolveConsentCookieName,
    resolvePurposesHashPrefix,
    writeConsentCookie
} from './consentState'
export {
    CONSENT_COOKIE_MAX_AGE_SECONDS,
    CONSENT_COOKIE_VERSION,
    DEFAULT_CONSENT_COOKIE_NAME,
    PURPOSES_HASH_PREFIX_LENGTH
} from './constants'
export {
    type CustomScriptIntegration,
    type Ga4Integration,
    type GoogleAdsIntegration,
    type GtmIntegration,
    googleConsentSignalsFor,
    type IntegrationApplyContext,
    type IntegrationDescriptor,
    IntegrationRegistry,
    type IntegrationType,
    type MetaPixelIntegration
} from './integrations'
export { type ConsentSnapshot, type ConsentStatusKind, ConsentStore } from './store'
export type {
    Cookie,
    CookieCategory,
    CookieConsentBannerConfig,
    CookieProviderConfig,
    LocalizedText,
    SupportedLanguage,
    Unit
} from './types'
