import type { CookieConsentBannerConfig, CookieProviderConfig, SupportedLanguage } from '../types'

export const essentialProvider: CookieProviderConfig = {
    name: 'Some Website',
    id: 'website',
    category: 'Essential',
    description:
        'We use session cookies to store your session on our website. This cookie is necessary to use the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'app_session',
            duration: 7,
            unit: 'days',
            purpose: 'Store the session'
        },
        {
            name: 'logged_in',
            duration: 7,
            unit: 'days',
            purpose: 'Store the login status'
        }
    ]
}

export const analyticsProvider: CookieProviderConfig = {
    name: 'Some Tracking Service',
    id: 'tracking',
    category: 'Analytics',
    description:
        'We use Some Tracking Service to collect anonymous statistics about the use of our website. This helps us to improve the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: '_pk_id',
            duration: 7,
            unit: 'days',
            purpose: 'Identifies returning visitors'
        },
        {
            name: '_pk_ses',
            duration: 7,
            unit: 'days',
            purpose: 'Stores the session of a visitor'
        }
    ]
}

export const marketingProvider: CookieProviderConfig = {
    name: 'Some Ad Network',
    id: 'ads',
    category: 'Marketing',
    description: 'We use Some Ad Network to serve relevant ads and measure their performance.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: '_ads_id',
            duration: 90,
            unit: 'days',
            purpose: 'Identifies the browser for ad targeting'
        }
    ]
}

export const defaultStoryConfig: CookieConsentBannerConfig = {
    lang: 'enUS' as SupportedLanguage,
    websiteName: 'React GDPR Consent Banner Demo',
    cookiePolicyLink: '/cookie-policy',
    domain: 'localhost',
    providers: [essentialProvider, analyticsProvider]
}

export const fullStoryConfig: CookieConsentBannerConfig = {
    ...defaultStoryConfig,
    providers: [essentialProvider, analyticsProvider, marketingProvider]
}
