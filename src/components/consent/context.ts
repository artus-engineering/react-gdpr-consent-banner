import { createContext } from 'react'
import { CookieConsentBannerConfig } from '../../types'
import { AuditService } from '../../auditService'

export interface ConsentState {
    isBannerOpen: boolean
    setIsBannerOpen: (isOpen: boolean) => void
    openBanner: () => void
    config: CookieConsentBannerConfig
    auditService: AuditService | null
}

export const ConsentStateProviderContext = createContext<ConsentState | null>(null)
