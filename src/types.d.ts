export type SupportedLanguage = 'deDE' | 'enUS'
export type Unit = 'days' | 'weeks' | 'months' | 'years' | 'session'
export type TranslationSections =
    | 'descriptions'
    | 'common'
    | 'buttons'
    | 'headings'
    | 'details'
    | 'links'
    | 'units'
    | 'cookieCategories'
    | 'cookieCategoryDescriptions'
    | 'consentGate'
    | 'cookiePolicy'
export type DescriptionSubSection = 'cookieDetails'
export type CommonSubSection = 'of'
export type ButtonSubSection = 'acceptAllCookies' | 'rejectAllNonNecessaryCookies' | 'acceptSelectedCookies' | 'showDetails' | 'back'
export type HeadingSubSection = 'details' | 'banner' | 'consentGate'
export type DetailsSubSection = 'expandCookieDetails' | 'cookieName' | 'cookieDuration' | 'cookieAccessors' | 'cookiePurpose' | 'moreInfoText' | 'privacyPolicyOf'
export type LinkSubSection = 'privacyPolicy' | 'cookiePolicy'
export type UnitSubSection = 'session' | 'days' | 'weeks' | 'months' | 'years' | 'daysPlural' | 'weeksPlural' | 'monthsPlural' | 'yearsPlural' | 'sessionPlural'
export type CookiePolicy = 'autoCookiePurpose' | 'autoCookieDescription'
export type ConsentGateSubSection = 'message'
export type SectionKeys<S extends TranslationSections> = keyof CookieConsentLabels[S]
// Simplified to 3 essential categories
export type CookieCategory = 'Essential' | 'Analytics' | 'Marketing'
export type CookieConsentState = Record<CookieCategory, { enabled: boolean; cookies: { [cookieId: string]: boolean } }>
export type CookieProvidersByCategory = Record<CookieCategory, CookieProviderConfig[]>

// Consent Hook System - Flexible integration for any tool
export type ConsentHookType = 'onAccept' | 'onReject' | 'onLoad'

export interface ConsentHook {
    id: string
    category: CookieCategory
    type: ConsentHookType
    execute: (context: ConsentHookContext) => void | Promise<void>
    description?: string
}

export interface ConsentHookContext {
    category: CookieCategory
    consentState: Record<CookieCategory, boolean>
    previousState?: Record<CookieCategory, boolean>
    cookies: {
        set: (name: string, value: string, options?: { expires?: number; domain?: string; path?: string }) => void
        get: (name: string) => string | null
        remove: (name: string, options?: { domain?: string; path?: string }) => void
    }
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
}

// Google Consent Mode v2 types (used internally by Google hooks)
export type GoogleConsentParameter =
    | 'ad_storage'
    | 'analytics_storage'
    | 'ad_user_data'
    | 'ad_personalization'
    | 'functionality_storage'
    | 'personalization_storage'
    | 'security_storage'
export type GoogleConsentValue = 'granted' | 'denied'
export type GoogleConsentState = Record<GoogleConsentParameter, GoogleConsentValue>
export type GoogleConsentMapping = Partial<Record<CookieCategory, GoogleConsentParameter[]>>

export type CookieConsentLabels = {
    descriptions: Record<DescriptionSubSection, string>
    common: Record<CommonSubSection, string>
    buttons: Record<ButtonSubSection, string>
    headings: Record<HeadingSubSection, string>
    details: Record<DetailsSubSection, string>
    links: Record<LinkSubSection, string>
    units: Record<UnitSubSection, string>
    cookieCategories: Record<CookieCategory, string>
    cookiePolicy: Record<CookiePolicy, string>
    consentGate: Record<ConsentGateSubSection, string>
    cookieCategoryDescriptions: Record<CookieCategory, string>
}

export interface CookieConsentBannerConfig {
    cookiePolicyLink: string
    websiteName: string
    providers: CookieProviderConfig[]
    domain: string
    crossSubDomainConsent?: string[]
    cookiesValidForDays?: number
    lang?: SupportedLanguage
    labels?: CookieConsentLabels
    theme?: CookieConsentStyle

    // Consent Hook System - Flexible integration for any tool
    consentHooks?: ConsentHook[]
}

export interface CookieConsentBannerConfigWithDefaults extends CookieConsentBannerConfig {
    cookiesValidForDays: number
}

export interface CookieConsentStyle extends Partial<CookieConsentStyleWithDefaults> {}

export interface CookieConsentStyleWithDefaults {
    bgPrimary: string
    bgSecondary: string
    textPrimary: string
    textSecondary: string
    primaryColor: string
    buttonText: string
}

export interface Cookie {
    name: string
    duration: number
    unit: Unit
    purpose: string | Record<SupportedLanguage, string>
    accessors?: string[]
}

export interface CookieProviderConfig {
    id: string
    name: string
    category: CookieCategory
    description: string | Record<SupportedLanguage, string>
    cookies: Cookie[]
    dataProtectionLink: string
    serviceProvider?: string
    code?: () => JSX.Element
}

export interface CookieBannerTheme extends CookieConsentStyleWithDefaults {}
