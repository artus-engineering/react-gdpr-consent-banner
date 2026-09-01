import { ConsentHook, CookieConsentBannerConfig } from './types'

interface LegacyConsentConfigFields {
    consentHooks?: ConsentHook[]
    crossSubDomainConsent?: string[]
    cookiesValidForDays?: number
}

export function legacyFieldsOf(config: CookieConsentBannerConfig): LegacyConsentConfigFields {
    return config
}
