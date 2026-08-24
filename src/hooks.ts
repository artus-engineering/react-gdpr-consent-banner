import { useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react'
import { ConsentState, ConsentStateProviderContext } from './components/consent/context'
import { resolveConsentCookieName } from './consentState'
import { DEFAULT_COOKIE_VALIDITY, DEFAULT_LANGUAGE } from './constants'
import { getLabel } from './functions'
import { ConsentSnapshot } from './store'
import { DefaultTheme } from './themes'
import {
    CookieConsentBannerConfigWithDefaults,
    CookieConsentStyleWithDefaults,
    CookieProviderConfig,
    CookieProvidersByCategory
} from './types'

export function useCookieConsentContext(parentHookName?: string): ConsentState {
    const context = useContext(ConsentStateProviderContext)
    if (!context) {
        throw new Error(`${parentHookName || 'useCookieConsentContext'} must be used within a CookieConsentProvider`)
    }
    return context
}

export function useOpenCookieBanner() {
    const { openBanner } = useCookieConsentContext('useOpenCookieBanner')
    return openBanner
}

/**
 * Subscribe to the current consent snapshot: the decision per provider and
 * whether the stored consent is valid, partial, stale, or absent.
 */
export function useConsentSnapshot(parentHookName?: string): ConsentSnapshot {
    const { store } = useCookieConsentContext(parentHookName || 'useConsentSnapshot')
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}

export function useSetStrictlyNecessaryCookiesOnly() {
    const { store } = useCookieConsentContext('useSetStrictlyNecessaryCookiesOnly')
    return useCallback(() => {
        store.rejectAll()
    }, [store])
}

/**
 * Get the configuration of the cookie banner.
 *
 * @returns {CookieConsentBannerConfigWithDefaults} The configuration of the cookie banner
 */
export function useConfig(parentHookName?: string): CookieConsentBannerConfigWithDefaults {
    const { config } = useCookieConsentContext(parentHookName || 'useConfig')

    return useMemo(
        () => ({
            ...config,
            lang: config.lang || DEFAULT_LANGUAGE,
            cookiesValidForDays: config.cookiesValidForDays || DEFAULT_COOKIE_VALIDITY
        }),
        [config]
    )
}

/**
 * Get the style settings of the cookie banner.
 *
 * @returns {CookieConsentStyleWithDefaults} The style of the cookie banner
 */
export function useStyle(): CookieConsentStyleWithDefaults {
    const { config } = useCookieConsentContext('useStyle')

    return useMemo(
        () => ({
            bgPrimary: config.theme?.bgPrimary || DefaultTheme.bgPrimary,
            bgSecondary: config.theme?.bgSecondary || DefaultTheme.bgSecondary,
            textPrimary: config.theme?.textPrimary || DefaultTheme.textPrimary,
            textSecondary: config.theme?.textSecondary || DefaultTheme.textSecondary,
            primaryColor: config.theme?.primaryColor || DefaultTheme.primaryColor,
            buttonText: config.theme?.buttonText || DefaultTheme.buttonText
        }),
        [config.theme]
    )
}

export function useCookieProviders(parentHookName?: string): CookieProviderConfig[] {
    const config = useConfig(parentHookName || 'useCookieProviders')

    // Memoize to prevent infinite re-renders in components that depend on this
    return useMemo(() => {
        const cookieConsentProvider: CookieProviderConfig = {
            name: 'Cookie Consents',
            id: 'cookie_consent',
            category: 'Essential',
            description: getLabel('cookiePolicy', 'autoCookieDescription', config),
            dataProtectionLink: config.cookiePolicyLink,
            cookies: [
                {
                    name: resolveConsentCookieName(config),
                    duration: 13,
                    unit: 'months',
                    accessors: [config.cookieDomain || config.domain],
                    purpose: getLabel('cookiePolicy', 'autoCookiePurpose', config)
                }
            ]
        }

        return [cookieConsentProvider, ...config.providers] as CookieProviderConfig[]
    }, [config])
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
    const snapshot = useConsentSnapshot('useCookieState')
    const consentGiven = cookieProvider.category === 'Essential' || snapshot.decisions[cookieProvider.id] === true
    const [manualValue, setManualValue] = useState<boolean | null>(null)
    const [lastConsentGiven, setLastConsentGiven] = useState(consentGiven)

    // A real consent change (accept/reject/revoke) supersedes any manual
    // override — otherwise the hook would keep reporting a stale value.
    if (consentGiven !== lastConsentGiven) {
        setLastConsentGiven(consentGiven)
        setManualValue(null)
    }

    const isEnabled = manualValue === null ? consentGiven : manualValue

    const setIsEnabled = (value: boolean | ((prev: boolean) => boolean)) => {
        if (typeof value === 'function') {
            setManualValue(prev => {
                const currentValue = prev === null ? consentGiven : prev
                const newValue = value(currentValue)
                if (newValue === consentGiven) {
                    return null
                }
                return newValue
            })
        } else if (value === consentGiven) {
            setManualValue(null)
        } else {
            setManualValue(value)
        }
    }

    return { isEnabled, setIsEnabled }
}
