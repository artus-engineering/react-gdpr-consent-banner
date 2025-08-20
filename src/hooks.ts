import { useContext, useEffect, useState } from 'react'
import { ConsentState, ConsentStateProviderContext } from './components/consent/context'
import { consentHookManager, createCookieUtils } from './consentHooks'
import { COOKIE_VALUE_TRUE, DEFAULT_COOKIE_VALIDITY, DEFAULT_LANGUAGE } from './constants'
import { cookieAccessor, getLabel, persistCookieSelection } from './functions'
import { DefaultTheme } from './themes'
import { ConsentHookContext, CookieCategory, CookieConsentBannerConfigWithDefaults, CookieConsentStyleWithDefaults, CookieProviderConfig, CookieProvidersByCategory } from './types'

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
            provider.category === 'Essential'
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
        primaryColor: config.theme?.primaryColor || DefaultTheme.primaryColor,
        buttonText: config.theme?.buttonText || DefaultTheme.buttonText
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
        category: 'Essential',
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

/**
 * Hook for managing consent with the new consent hooks system
 */
export function useConsentHooks() {
    const config = useConfig('useConsentHooks')
    const { auditService } = useCookieConsentContext('useConsentHooks')

    /**
     * Execute consent hooks when consent is given or withdrawn
     */
    const executeConsentChange = async (category: CookieCategory, hasConsent: boolean, previousConsent?: boolean) => {
        const cookieUtils = createCookieUtils(config.domain)

        // Build current consent state
        const consentState: Record<CookieCategory, boolean> = {
            Essential: true, // Always true
            Analytics: false,
            Marketing: false
        }

        // Update the changed category
        consentState[category] = hasConsent

        // Check other categories from cookies
        config.providers.forEach(provider => {
            if (provider.category !== 'Essential' && provider.category !== category) {
                const providerConsent = cookieUtils.get(`cookie_consent_${provider.id}`) === 'true'
                consentState[provider.category as CookieCategory] = consentState[provider.category as CookieCategory] || providerConsent
            }
        })

        const previousState: Record<CookieCategory, boolean> = { ...consentState }
        if (previousConsent !== undefined) {
            previousState[category] = previousConsent
        }

        const context: ConsentHookContext = {
            category,
            consentState,
            previousState,
            cookies: cookieUtils,
            gtag: (window as any).gtag,
            dataLayer: (window as any).dataLayer
        }

        // Log audit event if audit service is configured
        if (auditService) {
            const action = hasConsent ? 'accept' : 'reject'
            await auditService.logConsentChange(action, category, consentState, previousState)
        }

        // Execute appropriate hooks
        if (hasConsent && previousConsent !== true) {
            await consentHookManager.executeHooks(category, 'onAccept', context)
        } else if (!hasConsent && previousConsent !== false) {
            await consentHookManager.executeHooks(category, 'onReject', context)
        }
    }

    /**
     * Accept consent for a category
     */
    const acceptConsent = async (category: CookieCategory) => {
        const cookieUtils = createCookieUtils(config.domain)
        const previousConsent = cookieUtils.get(`cookie_consent_category_${category}`) === 'true'

        // Set category consent cookie
        cookieUtils.set(`cookie_consent_category_${category}`, 'true', {
            expires: config.cookiesValidForDays || DEFAULT_COOKIE_VALIDITY
        })

        await executeConsentChange(category, true, previousConsent)
    }

    /**
     * Reject consent for a category
     */
    const rejectConsent = async (category: CookieCategory) => {
        const cookieUtils = createCookieUtils(config.domain)
        const previousConsent = cookieUtils.get(`cookie_consent_category_${category}`) === 'true'

        // Remove category consent cookie
        cookieUtils.remove(`cookie_consent_category_${category}`)

        await executeConsentChange(category, false, previousConsent)
    }

    /**
     * Check if consent is given for a category
     */
    const hasConsent = (category: CookieCategory): boolean => {
        if (category === 'Essential') return true

        const cookieUtils = createCookieUtils(config.domain)
        return cookieUtils.get(`cookie_consent_category_${category}`) === 'true'
    }

    /**
     * Get all current consent states
     */
    const getConsentState = (): Record<CookieCategory, boolean> => {
        return {
            Essential: true,
            Analytics: hasConsent('Analytics'),
            Marketing: hasConsent('Marketing')
        }
    }

    return {
        acceptConsent,
        rejectConsent,
        hasConsent,
        getConsentState,
        executeConsentChange
    }
}
