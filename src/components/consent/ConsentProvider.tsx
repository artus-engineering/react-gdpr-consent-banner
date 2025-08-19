import React, { useCallback, useState } from 'react'
import { CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE } from '../../constants'
import { isServer } from '../../functions'
import { CookieConsentBannerConfig } from '../../types'
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

export function CookieConsentProvider({ children, config, includeCookieBanner = true }: ConsentProviderProps): JSX.Element {
    const [isBannerOpen, setIsBannerOpen] = useState<boolean>(hasCookieBannerBeenShown())

    const openBanner = useCallback(() => setIsBannerOpen(false), [])

    return (
        <ConsentStateProviderContext.Provider value={{ isBannerOpen, setIsBannerOpen, openBanner, config }}>
            {children}
            {includeCookieBanner && <CookieConsentBanner />}
        </ConsentStateProviderContext.Provider>
    )
}
