import { createContext } from 'react'
import { AuditService } from '../../auditService'
import { CookieConsentBannerConfig } from '../../types'

export interface ConsentState {
    isBannerOpen: boolean
    setIsBannerOpen: (isOpen: boolean) => void
    openBanner: () => void
    config: CookieConsentBannerConfig
    auditService: AuditService | null
}

export const ConsentStateProviderContext = createContext<ConsentState | null>(null)
