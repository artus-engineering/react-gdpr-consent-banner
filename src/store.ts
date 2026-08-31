import {
    ConsentDecisions,
    ConsentStateConfig,
    ConsentStatus,
    consentStateConfigFrom,
    getConsentStatus,
    migrateLegacyConsentCookies,
    refreshConsentCookie,
    writeConsentCookie
} from './consentState'
import { isServer } from './functions'
import { CookieConsentBannerConfig } from './types'

export type ConsentStatusKind = ConsentStatus['kind']

export interface ConsentSnapshot {
    status: ConsentStatusKind
    decisions: ConsentDecisions
}

export type ConsentChangeListener = (snapshot: ConsentSnapshot, previous: ConsentSnapshot) => void

const SERVER_SNAPSHOT: ConsentSnapshot = { status: 'none', decisions: {} }

/**
 * Client-side consent state: the single writer of the v2 consent cookie and
 * the event source replacing the v1 per-provider cookie polling. One instance
 * per `CookieConsentProvider` — no module-level singleton.
 */
export class ConsentStore {
    private state: ConsentStateConfig
    private snapshot: ConsentSnapshot
    private readonly listeners = new Set<ConsentChangeListener>()

    constructor(config: CookieConsentBannerConfig) {
        this.state = consentStateConfigFrom(config)
        this.snapshot = this.evaluate()
    }

    /** Run once on the client: migrate v1 cookies, then renew the cookie max age. */
    initialize(): void {
        if (isServer()) {
            return
        }
        migrateLegacyConsentCookies(this.state)
        refreshConsentCookie(this.state)
        this.refreshSnapshot()
    }

    /** Config-swap safe: re-evaluates against the new provider set and purposes hash. */
    setConfig(config: CookieConsentBannerConfig): void {
        this.state = consentStateConfigFrom(config)
        this.refreshSnapshot()
    }

    getSnapshot = (): ConsentSnapshot => this.snapshot

    getServerSnapshot = (): ConsentSnapshot => SERVER_SNAPSHOT

    subscribe = (listener: ConsentChangeListener): (() => void) => {
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
    }

    acceptAll(): void {
        const decisions: ConsentDecisions = {}
        for (const provider of this.state.providers) {
            if (provider.category !== 'Essential') {
                decisions[provider.id] = true
            }
        }
        this.persist(decisions)
    }

    rejectAll(): void {
        const decisions: ConsentDecisions = {}
        for (const provider of this.state.providers) {
            if (provider.category !== 'Essential') {
                decisions[provider.id] = false
            }
        }
        this.persist(decisions)
    }

    applySelection(decisions: ConsentDecisions): void {
        const complete: ConsentDecisions = {}
        for (const provider of this.state.providers) {
            if (provider.category !== 'Essential') {
                complete[provider.id] = decisions[provider.id] === true
            }
        }
        this.persist(complete)
    }

    /**
     * Grant a single provider from a `CookieConsentGate`. Without a prior full
     * banner decision this is stored as a partial decision — the banner keeps
     * asking on the next visit.
     */
    grantForGate(providerId: string): void {
        const current = this.snapshot
        const decisions: ConsentDecisions = { ...current.decisions, [providerId]: true }
        this.persist(decisions, current.status !== 'valid')
    }

    private persist(decisions: ConsentDecisions, partial = false): void {
        writeConsentCookie({
            cookieName: this.state.cookieName,
            purposesHashPrefix: this.state.purposesHashPrefix,
            decisions,
            partial,
            domain: this.state.domain,
            cookieDomain: this.state.cookieDomain
        })
        this.refreshSnapshot()
    }

    private evaluate(): ConsentSnapshot {
        const status = getConsentStatus(this.state)
        return { status: status.kind, decisions: status.decisions }
    }

    private refreshSnapshot(): void {
        const previous = this.snapshot
        const next = this.evaluate()
        const unchanged =
            previous.status === next.status &&
            Object.keys(next.decisions).length === Object.keys(previous.decisions).length &&
            Object.entries(next.decisions).every(([id, granted]) => previous.decisions[id] === granted)
        if (unchanged) {
            return
        }
        this.snapshot = next
        for (const listener of this.listeners) {
            listener(next, previous)
        }
    }
}
