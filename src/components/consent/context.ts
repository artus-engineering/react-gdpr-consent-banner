import { createContext } from 'react'
import { ConsentStore } from '../../store'
import { CookieConsentBannerConfig } from '../../types'

export interface ConsentState {
    isBannerOpen: boolean
    setIsBannerOpen: (isOpen: boolean) => void
    openBanner: () => void
    config: CookieConsentBannerConfig
    store: ConsentStore
}

export const ConsentStateProviderContext = createContext<ConsentState | null>(null)
