import {
    CONSENT_COOKIE_MAX_AGE_SECONDS,
    CONSENT_COOKIE_VERSION,
    DEFAULT_CONSENT_COOKIE_NAME,
    LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED,
    LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE,
    LEGACY_COOKIE_SUFFIX,
    LEGACY_COOKIE_VALUE_TRUE,
    PURPOSES_HASH_PREFIX_LENGTH
} from './constants'
import { isServer } from './functions'
import { CookieConsentBannerConfig, CookieProviderConfig } from './types'

/**
 * Consent cookie v2.
 *
 * One first-party cookie replaces the v1 per-provider cookies. Its content is
 * deliberately minimal (no UID, no timestamp, no fingerprint — DSK/CNIL
 * guidance): the decision per non-essential provider, plus the purposes-hash
 * prefix identifying the configuration the consent refers to. A cookie is also
 * written on rejection so returning visitors are not asked again.
 */

export type ConsentDecisions = Record<string, boolean>

export interface ConsentCookiePayload {
    v: number
    /** Purposes-hash prefix the decision refers to. Mismatch ⇒ material change ⇒ re-consent. */
    ph: string
    /** Decision per non-essential provider id. Essential is implied granted and never stored. */
    d: Record<string, 0 | 1>
    /** Present when the decision is partial (e.g. a single ConsentGate grant) — keep asking. */
    p?: 1
}

export type ConsentStatus =
    | { kind: 'none'; decisions: ConsentDecisions }
    | { kind: 'partial'; decisions: ConsentDecisions }
    | { kind: 'stale'; decisions: ConsentDecisions }
    | { kind: 'valid'; decisions: ConsentDecisions }

interface CookieScopeOptions {
    domain?: string
    cookieDomain?: string
}

function parseCookieHeader(): [string, string][] {
    if (isServer() || !document.cookie) {
        return []
    }
    return document.cookie.split('; ').flatMap(entry => {
        const separatorIndex = entry.indexOf('=')
        if (separatorIndex <= 0) {
            return []
        }
        return [[entry.slice(0, separatorIndex), entry.slice(separatorIndex + 1)] as [string, string]]
    })
}

/** Exact-name cookie lookup — never matches `mega_consent` when asked for `ga_consent`. */
export function getCookieValue(name: string): string | null {
    for (const [cookieName, value] of parseCookieHeader()) {
        if (cookieName === name) {
            return value
        }
    }
    return null
}

/**
 * True when the same cookie name is visible more than once (differently scoped
 * cookies, e.g. host-only vs. `Domain=` after a `cookieDomain` change). Reads
 * are ambiguous then — the browser lists the OLDER cookie first, which would
 * silently shadow newer decisions.
 */
export function hasAmbiguousCookie(name: string): boolean {
    let seen = 0
    for (const [cookieName] of parseCookieHeader()) {
        if (cookieName === name && ++seen > 1) {
            return true
        }
    }
    return false
}

function isLocalhost(): boolean {
    const hostname = globalThis.window.location.hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
}

function cookieSecurityAttributes(): string {
    const secure = globalThis.window.location.protocol === 'https:' && !isLocalhost() ? '; Secure' : ''
    return `; path=/; SameSite=Lax${secure}`
}

/**
 * The consent cookie is host-only by default — a `Domain=` attribute is written
 * only when `cookieDomain` is explicitly configured (subdomain-wide consent).
 * Stamping `domain` here would make browsers silently drop the write on any
 * host the attribute does not domain-match (apex vs. www, previews, dev hosts).
 */
function cookieDomainAttribute(scope: CookieScopeOptions): string {
    if (isLocalhost() || !scope.cookieDomain) {
        return ''
    }
    return `; domain=${scope.cookieDomain}`
}

export function removeCookie(name: string, scope: CookieScopeOptions = {}): void {
    if (isServer()) {
        return
    }
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    const hostname = globalThis.window.location.hostname
    const domainVariants = new Set<string | null>([null, hostname, `.${hostname}`])
    if (scope.domain) {
        domainVariants.add(scope.domain)
        domainVariants.add(`.${scope.domain.replace(/^\./, '')}`)
    }
    if (scope.cookieDomain) {
        domainVariants.add(scope.cookieDomain)
    }
    for (const domain of domainVariants) {
        document.cookie = domain ? `${expired}; domain=${domain}` : expired
    }
}

/**
 * Remove cookies by name pattern. A trailing `*` matches any suffix
 * (`_ga_*` matches `_ga_ABC123`), fixing the v1 no-op wildcard deletion.
 */
export function removeCookiesMatching(pattern: string, scope: CookieScopeOptions = {}): void {
    if (isServer()) {
        return
    }
    const matches = (name: string): boolean => {
        if (pattern.endsWith('*')) {
            return name.startsWith(pattern.slice(0, -1))
        }
        return name === pattern
    }
    const names = parseCookieHeader()
        .map(([name]) => name)
        .filter(matches)
    if (names.length === 0 && !pattern.includes('*')) {
        removeCookie(pattern, scope)
        return
    }
    for (const name of names) {
        removeCookie(name, scope)
    }
}

export function resolveConsentCookieName(config: Pick<CookieConsentBannerConfig, 'cookieName'>): string {
    return config.cookieName || DEFAULT_CONSENT_COOKIE_NAME
}

function fnv1a32(input: string, seed: number): number {
    let hash = seed >>> 0
    for (let index = 0; index < input.length; index++) {
        hash ^= input.codePointAt(index) ?? 0
        hash = Math.imul(hash, 0x01000193) >>> 0
    }
    return hash >>> 0
}

interface MaterialIntegrationRef {
    providerId: string
    type: string
}

/**
 * Deterministic 64-bit fingerprint (two seeded FNV-1a 32-bit runs) over the
 * material configuration: provider ids + categories and integration targets +
 * types — mirroring what the platform's purposes hash covers. Fallback for
 * standalone library usage without a platform-computed `purposesHash`. The
 * canonical form is JSON-encoded, so ids containing separator characters
 * cannot collide.
 */
export function derivePurposesFingerprint(
    providers: readonly CookieProviderConfig[],
    integrations: readonly MaterialIntegrationRef[] = []
): string {
    const byCodeUnits = (a: string, b: string): number => {
        if (a < b) {
            return -1
        }
        if (a > b) {
            return 1
        }
        return 0
    }
    const canonical = JSON.stringify({
        p: providers.map(provider => [provider.id, provider.category]).sort((a, b) => byCodeUnits(a[0], b[0])),
        i: integrations
            .map(integration => [integration.providerId, integration.type])
            .sort((a, b) => byCodeUnits(a[0], b[0]) || byCodeUnits(a[1], b[1]))
    })
    const high = fnv1a32(canonical, 0x811c9dc5)
    const low = fnv1a32(canonical, 0x811c9dc5 ^ 0x5bd1e995)
    return high.toString(16).padStart(8, '0') + low.toString(16).padStart(8, '0')
}

export function resolvePurposesHashPrefix(
    config: Pick<CookieConsentBannerConfig, 'purposesHash' | 'providers'> & {
        integrations?: readonly MaterialIntegrationRef[]
    }
): string {
    const configured = config.purposesHash?.trim().toLowerCase()
    if (configured && /^[0-9a-f]{16,64}$/.test(configured)) {
        return configured.slice(0, PURPOSES_HASH_PREFIX_LENGTH)
    }
    return derivePurposesFingerprint(config.providers, config.integrations ?? [])
}

export function readConsentCookie(cookieName: string): ConsentCookiePayload | null {
    const raw = getCookieValue(cookieName)
    if (!raw) {
        return null
    }
    try {
        const parsed = JSON.parse(decodeURIComponent(raw))
        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            parsed.v !== CONSENT_COOKIE_VERSION ||
            typeof parsed.ph !== 'string' ||
            typeof parsed.d !== 'object' ||
            parsed.d === null
        ) {
            return null
        }
        const decisions: Record<string, 0 | 1> = {}
        for (const [providerId, value] of Object.entries(parsed.d as Record<string, unknown>)) {
            if (value !== 0 && value !== 1) {
                return null
            }
            decisions[providerId] = value
        }
        const payload: ConsentCookiePayload = { v: CONSENT_COOKIE_VERSION, ph: parsed.ph, d: decisions }
        if (parsed.p === 1) {
            payload.p = 1
        }
        return payload
    } catch {
        return null
    }
}

export interface WriteConsentCookieOptions extends CookieScopeOptions {
    cookieName: string
    purposesHashPrefix: string
    decisions: ConsentDecisions
    partial?: boolean
}

export function writeConsentCookie(options: WriteConsentCookieOptions): void {
    if (isServer()) {
        return
    }
    // Expire every other-scope variant of the consent cookie first: a stale
    // same-name cookie in a different Domain scope would otherwise shadow this
    // write forever (browsers list the older cookie first).
    removeCookie(options.cookieName, options)
    const payload: ConsentCookiePayload = {
        v: CONSENT_COOKIE_VERSION,
        ph: options.purposesHashPrefix,
        d: Object.fromEntries(
            Object.entries(options.decisions).map(([providerId, granted]) => [providerId, granted ? 1 : 0])
        )
    }
    if (options.partial) {
        payload.p = 1
    }
    const value = encodeURIComponent(JSON.stringify(payload))
    const cookie = `${options.cookieName}=${value}${cookieDomainAttribute(options)}${cookieSecurityAttributes()}; max-age=${CONSENT_COOKIE_MAX_AGE_SECONDS}`
    document.cookie = cookie
}

export interface ConsentStateConfig {
    cookieName: string
    purposesHashPrefix: string
    providers: readonly CookieProviderConfig[]
    domain?: string
    cookieDomain?: string
}

export function consentStateConfigFrom(config: CookieConsentBannerConfig): ConsentStateConfig {
    return {
        cookieName: resolveConsentCookieName(config),
        purposesHashPrefix: resolvePurposesHashPrefix(config),
        providers: config.providers,
        domain: config.domain,
        cookieDomain: config.cookieDomain
    }
}

function emptyDecisions(providers: readonly CookieProviderConfig[]): ConsentDecisions {
    const decisions: ConsentDecisions = {}
    for (const provider of providers) {
        if (provider.category !== 'Essential') {
            decisions[provider.id] = false
        }
    }
    return decisions
}

function decisionsFromPayload(
    payload: ConsentCookiePayload,
    providers: readonly CookieProviderConfig[]
): ConsentDecisions {
    const decisions = emptyDecisions(providers)
    for (const providerId of Object.keys(decisions)) {
        decisions[providerId] = payload.d[providerId] === 1
    }
    return decisions
}

/**
 * Evaluate the stored consent against the current configuration. A stale
 * cookie (purposes-hash mismatch = material change) is treated as absent
 * consent — previous grants are NOT applied (fail-closed).
 */
export function getConsentStatus(state: ConsentStateConfig): ConsentStatus {
    const noDecisions = emptyDecisions(state.providers)
    if (isServer()) {
        return { kind: 'none', decisions: noDecisions }
    }
    if (hasAmbiguousCookie(state.cookieName)) {
        // Differently-scoped duplicates make reads ambiguous — treat as absent
        // (fail-closed, re-ask); the next decision purges all variants.
        return { kind: 'none', decisions: noDecisions }
    }
    const payload = readConsentCookie(state.cookieName)
    if (!payload) {
        return { kind: 'none', decisions: noDecisions }
    }
    if (payload.ph !== state.purposesHashPrefix) {
        return { kind: 'stale', decisions: noDecisions }
    }
    const decisions = decisionsFromPayload(payload, state.providers)
    if (payload.p === 1) {
        return { kind: 'partial', decisions }
    }
    return { kind: 'valid', decisions }
}

/**
 * One-time migration from the v1 cookies (`{id}_consent` + display flag) to
 * the v2 cookie. Assumes no material change happened at upgrade time (the
 * current purposes hash is stamped onto the migrated decision).
 */
export function migrateLegacyConsentCookies(state: ConsentStateConfig): boolean {
    if (isServer() || readConsentCookie(state.cookieName)) {
        return false
    }
    const displayed = getCookieValue(LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED)
    if (displayed !== LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE) {
        return false
    }
    const decisions: ConsentDecisions = {}
    for (const provider of state.providers) {
        if (provider.category === 'Essential') {
            continue
        }
        decisions[provider.id] = getCookieValue(`${provider.id}${LEGACY_COOKIE_SUFFIX}`) === LEGACY_COOKIE_VALUE_TRUE
    }
    writeConsentCookie({
        cookieName: state.cookieName,
        purposesHashPrefix: state.purposesHashPrefix,
        decisions,
        domain: state.domain,
        cookieDomain: state.cookieDomain
    })
    for (const provider of state.providers) {
        removeCookie(`${provider.id}${LEGACY_COOKIE_SUFFIX}`, state)
    }
    removeCookie(LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED, state)
    return true
}

/** Re-write the stored cookie unchanged, renewing its max age ("no expiry" semantics). */
export function refreshConsentCookie(state: ConsentStateConfig): void {
    if (isServer() || hasAmbiguousCookie(state.cookieName)) {
        return
    }
    const payload = readConsentCookie(state.cookieName)
    const purposesHash = payload?.ph
    if (!payload || purposesHash !== state.purposesHashPrefix) {
        return
    }
    writeConsentCookie({
        cookieName: state.cookieName,
        purposesHashPrefix: purposesHash,
        decisions: Object.fromEntries(Object.entries(payload.d).map(([id, value]) => [id, value === 1])),
        partial: payload.p === 1,
        domain: state.domain,
        cookieDomain: state.cookieDomain
    })
}
