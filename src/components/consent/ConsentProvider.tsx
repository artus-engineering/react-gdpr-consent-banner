import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createAuditService } from '../../auditService'
import { consentHookManager, createCookieUtils } from '../../consentHooks'
import { CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE } from '../../constants'
import { isServer } from '../../functions'
import { ConsentHookContext, CookieCategory, CookieConsentBannerConfig } from '../../types'
import { CookieConsentBanner } from './ConsentBanner'
import { ConsentStateProviderContext } from './context'

interface ConsentProviderProps {
    children: React.ReactNode
    config: CookieConsentBannerConfig
    includeCookieBanner?: boolean
}

/**
 * Check if the user has given consent to use cookies.
 *
 * @returns {boolean | null} True if the user has given consent, false otherwise. Null if the code is running on the server.
 */
function hasCookieBannerBeenShown(): boolean {
    if (isServer()) {
        return false
    }
    return !!document.cookie.includes(`${CONSENT_DIALOG_HAS_BEEN_DISPLAYED}=${CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE}`)
}

export function CookieConsentProvider({
    children,
    config,
    includeCookieBanner = true
}: ConsentProviderProps): JSX.Element {
    const [isBannerOpen, setIsBannerOpen] = useState<boolean>(!hasCookieBannerBeenShown())

    const openBanner = useCallback(() => setIsBannerOpen(true), [])

    // Create audit service if configured - memoize to prevent re-renders
    const auditService = useMemo(
        () => createAuditService(config.audit, config.websiteName, config.domain),
        [config.audit, config.websiteName, config.domain]
    )

    // Initialize consent hooks system - run only once on mount
    useEffect(() => {
        // Register consent hooks
        if (config.consentHooks) {
            consentHookManager.registerHooks(config.consentHooks)
        }

        // Execute onLoad hooks for all categories that have consent
        const executeOnLoadHooks = async () => {
            const cookieUtils = createCookieUtils(config.domain)
            const consentState: Record<CookieCategory, boolean> = {
                Essential: true, // Always true
                Functional: false,
                Analytics: false,
                Marketing: false
            }

            // Check current consent state from cookies
            config.providers.forEach(provider => {
                if (provider.category !== 'Essential') {
                    const hasConsent = cookieUtils.get(`cookie_consent_${provider.id}`) === 'true'
                    consentState[provider.category as CookieCategory] =
                        consentState[provider.category as CookieCategory] || hasConsent
                }
            })

            const context: ConsentHookContext = {
                category: 'Essential', // Will be overridden in executeHooks
                consentState,
                cookies: cookieUtils,
                gtag: (window as any).gtag,
                dataLayer: (window as any).dataLayer
            }

            // Execute onLoad hooks for each category
            for (const category of Object.keys(consentState) as CookieCategory[]) {
                if (consentState[category]) {
                    await consentHookManager.executeHooks(category, 'onLoad', {
                        ...context,
                        category
                    })
                }
            }
        }

        if (!isServer()) {
            executeOnLoadHooks()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            isBannerOpen,
            setIsBannerOpen,
            openBanner,
            config,
            auditService
        }),
        [isBannerOpen, setIsBannerOpen, openBanner, config, auditService]
    )

    return (
        <ConsentStateProviderContext.Provider value={contextValue}>
            {children}
            {includeCookieBanner && <CookieConsentBanner />}
        </ConsentStateProviderContext.Provider>
    )
}
