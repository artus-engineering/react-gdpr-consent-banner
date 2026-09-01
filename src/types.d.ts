import type { IntegrationDescriptor } from './integrations'

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
export type DescriptionSubSection = 'cookieDetails' | 'reconsentNotice'
export type CommonSubSection = 'of'
export type ButtonSubSection =
    | 'acceptAllCookies'
    | 'rejectAllNonNecessaryCookies'
    | 'acceptSelectedCookies'
    | 'showDetails'
    | 'back'
export type HeadingSubSection = 'details' | 'banner' | 'consentGate'
export type DetailsSubSection =
    | 'expandCookieDetails'
    | 'cookieName'
    | 'cookieDuration'
    | 'cookieAccessors'
    | 'cookiePurpose'
    | 'moreInfoText'
    | 'privacyPolicyOf'
export type LinkSubSection = 'privacyPolicy' | 'cookiePolicy'
export type UnitSubSection =
    | 'session'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years'
    | 'daysPlural'
    | 'weeksPlural'
    | 'monthsPlural'
    | 'yearsPlural'
    | 'sessionPlural'
export type CookiePolicy = 'autoCookiePurpose' | 'autoCookieDescription'
export type ConsentGateSubSection = 'message'
export type SectionKeys<S extends TranslationSections> = keyof CookieConsentLabels[S]
// Cookie categories for GDPR compliance
export type CookieCategory = 'Essential' | 'Functional' | 'Analytics' | 'Marketing'
export type CookieConsentState = Record<CookieCategory, { enabled: boolean; cookies: { [cookieId: string]: boolean } }>
export type CookieProvidersByCategory = Record<CookieCategory, CookieProviderConfig[]>

/**
 * Consent Hook System
 *
 * Package consumers should prefer the declarative `integrations` config.
 * Consent hooks remain functional throughout 2.x and will be removed in 3.0.
 */
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

/** Partial label overrides — any subset of sections and keys. */
export type PartialCookieConsentLabels = {
    [S in TranslationSections]?: Partial<CookieConsentLabels[S]>
}

export interface CookieConsentBannerConfig {
    cookiePolicyLink: string
    websiteName: string
    providers: CookieProviderConfig[]
    domain: string
    /**
     * Written as the cookie `Domain=` attribute for subdomain-wide consent
     * (e.g. `.example.com`). Defaults to `domain`.
     */
    cookieDomain?: string
    /** Name of the consent cookie. Defaults to `artus_consent`. */
    cookieName?: string
    /**
     * Hex purposes hash (16–64 chars) identifying the material configuration
     * this consent refers to; a mismatch with the stored cookie triggers
     * re-consent. Computed by the platform at publish time. Without it, a
     * local fingerprint over provider ids and categories is used.
     */
    purposesHash?: string
    /** Declarative tool integrations, injected only after consent (strict loading). */
    integrations?: IntegrationDescriptor[]
    lang?: SupportedLanguage
    labels?: PartialCookieConsentLabels
    theme?: CookieConsentStyle

    /**
     * @deprecated Use the declarative `integrations` config instead. Consent
     * hooks remain functional throughout 2.x and will be removed in 3.0.
     */
    consentHooks?: ConsentHook[]
    /** @deprecated Display-only in v1; use `cookieDomain` for real subdomain-wide consent. */
    crossSubDomainConsent?: string[]
    /**
     * @deprecated The v2 consent cookie has a fixed max age (400 days, the
     * Chrome cap) and is renewed on every visit; consent itself does not expire.
     */
    cookiesValidForDays?: number
}

export interface CookieConsentBannerConfigWithDefaults extends Omit<CookieConsentBannerConfig, 'cookiesValidForDays'> {
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

/** Localizable text — locale-style keys (`deDE`) or platform short codes (`de`). */
export type LocalizedText = string | Partial<Record<SupportedLanguage | 'de' | 'en', string>>

export interface Cookie {
    name: string
    duration: number
    unit: Unit
    purpose: LocalizedText
    accessors?: string[]
}

export interface CookieProviderConfig {
    id: string
    name: string
    category: CookieCategory
    description: LocalizedText
    cookies: Cookie[]
    dataProtectionLink: string
    serviceProvider?: string
}

export interface CookieBannerTheme extends CookieConsentStyleWithDefaults {}
