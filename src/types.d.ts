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
export type DetailsSubSection = 'expandCookieDetails' | 'cookieName' | 'cookieDuration' | 'cookieAccessors' | 'cookiePurpose'
export type LinkSubSection = 'privacyPolicy' | 'cookiePolicy'
export type UnitSubSection = 'session' | 'days' | 'weeks' | 'months' | 'years' | 'daysPlural' | 'weeksPlural' | 'monthsPlural' | 'yearsPlural' | 'sessionPlural'
export type CookiePolicy = 'autoCookiePurpose' | 'autoCookieDescription'
export type ConsentGateSubSection = 'message'
export type SectionKeys<S extends TranslationSections> = keyof CookieConsentLabels[S]
export type CookieCategory = 'StrictlyNecessary' | 'Preferences' | 'Statistics' | 'Marketing' | 'Functional' | 'NotClassified'
export type CookieConsentState = Record<CookieCategory, { enabled: boolean; cookies: { [cookieId: string]: boolean } }>
export type CookieProvidersByCategory = Record<CookieCategory, CookieProviderConfig[]>

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
    buttonBgTrue: string
    buttonBgFalse: string
    buttonBg: string
    buttonText: string
}

export interface Cookie {
    name: string
    duration: number
    unit: Unit
    purpose: string
    accessors?: string[]
}

export interface CookieProviderConfig {
    id: string
    name: string
    category: CookieCategory
    description: string
    cookies: Cookie[]
    dataProtectionLink: string
    code?: () => JSX.Element
}

export interface CookieBannerTheme extends CookieConsentStyleWithDefaults {}
