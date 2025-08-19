import { useContext, useEffect, useState } from 'react'
import { ConsentState, ConsentStateProviderContext } from './components/consent/context'
import { COOKIE_VALUE_TRUE, DEFAULT_COOKIE_VALIDITY, DEFAULT_LANGUAGE } from './constants'
import { cookieAccessor, getLabel, persistCookieSelection } from './functions'
import { DefaultTheme } from './themes'
import { CookieConsentBannerConfigWithDefaults, CookieConsentStyleWithDefaults, CookieProviderConfig, CookieProvidersByCategory } from './types'

export function useCookieConsentContext(parentHookName?: string): ConsentState {
    const context = useContext(ConsentStateProviderContext)
    if (!context) {
        throw new Error(`${parentHookName || 'useCookieConsentContext'} must be used within a CookieConsentProvider`)
    }
    return context
}

export function useOpenCookieBanner() {
    const { openBanner } = useCookieConsentContext('useOpenBanner')
    return openBanner
}

export function useSetStrictlyNecessaryCookiesOnly() {
    const config = useConfig('useSetStrictlyNecessaryCookiesOnly')
    return () =>
        config.providers.forEach(provider =>
            provider.category === 'StrictlyNecessary'
                ? persistCookieSelection(provider, true, config.domain, config.cookiesValidForDays)
                : persistCookieSelection(provider, false, config.domain, config.cookiesValidForDays)
        )
}

/**
 * Get the configuration of the cookie banner.
 *
 * @returns {CookieConsentBannerConfigWithDefaults} The configuration of the cookie banner
 */
export function useConfig(parentHookName?: string): CookieConsentBannerConfigWithDefaults {
    const { config } = useCookieConsentContext(parentHookName || 'useConfig')

    const configWithDefaults: CookieConsentBannerConfigWithDefaults = {
        ...config,
        lang: config.lang || DEFAULT_LANGUAGE,
        cookiesValidForDays: config.cookiesValidForDays || DEFAULT_COOKIE_VALIDITY
    }

    return configWithDefaults
}

/**
 * Get the style settings of the cookie banner.
 *
 * @returns {CookieConsentStyleWithDefaults} The style of the cookie banner
 */
export function useStyle(): CookieConsentStyleWithDefaults {
    const { config } = useCookieConsentContext('useStyle')

    config.theme = {
        bgPrimary: config.theme?.bgPrimary || DefaultTheme.bgPrimary,
        bgSecondary: config.theme?.bgSecondary || DefaultTheme.bgSecondary,
        textPrimary: config.theme?.textPrimary || DefaultTheme.textPrimary,
        textSecondary: config.theme?.textSecondary || DefaultTheme.textSecondary,
        buttonBgTrue: config.theme?.buttonBgTrue || DefaultTheme.buttonBgTrue,
        buttonBgFalse: config.theme?.buttonBgFalse || DefaultTheme.buttonBgFalse
    }

    return config.theme as CookieConsentStyleWithDefaults
}

/**
 * Listen to changes of a cookie.
 *
 * @param cookieName The name of the cookie to listen to.
 * @returns The value of the cookie.
 */
export function useCookieListener(cookieName: string) {
    const [cookieValue, setCookieValue] = useState<string | null>(
        document.cookie
            .split('; ')
            .find(row => row.startsWith(cookieName))
            ?.split('=')[1] || null
    )

    useEffect(() => {
        const intervalId = setInterval(() => {
            const newCookieValue =
                document.cookie
                    .split('; ')
                    .find(row => row.startsWith(cookieName))
                    ?.split('=')[1] || null
            if (newCookieValue !== cookieValue) {
                setCookieValue(newCookieValue)
            }
        }, 1000)

        return () => clearInterval(intervalId)
    }, [cookieName, cookieValue])

    return cookieValue
}

export function useCookieProviders(parentHookName?: string): CookieProviderConfig[] {
    const config = useConfig(parentHookName || 'useCookieProviders')

    const cookieConsentProvider: CookieProviderConfig = {
        name: 'Cookie Consents',
        id: 'cookie_consent',
        category: 'StrictlyNecessary',
        description: getLabel('cookiePolicy', 'autoCookieDescription'),
        dataProtectionLink: config.cookiePolicyLink,
        cookies: config.providers.map(provider => {
            return {
                name: cookieAccessor(provider),
                duration: config.cookiesValidForDays,
                unit: 'days',
                accessors: [config.domain],
                purpose: getLabel('cookiePolicy', 'autoCookiePurpose')
            }
        })
    }

    return [cookieConsentProvider, ...config.providers] as CookieProviderConfig[]
}

export function useCookieProvidersByCategory(): CookieProvidersByCategory {
    const cookieProviders = useCookieProviders('useCookieProvidersByCategory')
    return cookieProviders.reduce((acc, provider) => {
        if (!acc[provider.category]) {
            acc[provider.category] = []
        }
        acc[provider.category].push(provider)
        return acc
    }, {} as CookieProvidersByCategory)
}

export function useCookieState({ cookieProvider }: { cookieProvider: CookieProviderConfig }) {
    const cookieName = cookieAccessor(cookieProvider)
    const cookieValue = useCookieListener(cookieName)
    const consentGiven = cookieValue === COOKIE_VALUE_TRUE
    const [isEnabled, setIsEnabled] = useState(consentGiven)

    useEffect(() => setIsEnabled(consentGiven), [cookieValue])

    return { isEnabled, setIsEnabled }
}
