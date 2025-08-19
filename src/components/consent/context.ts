import { createContext } from 'react'
import { CookieConsentBannerConfig } from '../../types'

export interface ConsentState {
    isBannerOpen: boolean
    setIsBannerOpen: (isOpen: boolean) => void
    openBanner: () => void
    config: CookieConsentBannerConfig
}

export const ConsentStateProviderContext = createContext<ConsentState | null>(null)
