import { ConsentDecisions, removeCookiesMatching } from './consentState'
import { isServer } from './functions'
import { CookieCategory, CookieProviderConfig } from './types'

/**
 * Declarative integrations — the JSON-serializable replacement for
 * `consentHooks`. The descriptor shape mirrors the platform's published
 * config artifact so remote configs map 1:1 onto this runtime.
 *
 * Strict loading: no third-party script is injected before the visitor has
 * granted the provider the integration belongs to. Google Consent Mode v2
 * defaults are still pushed as `denied` up front, defensively.
 */

export const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]{4,10}$/
export const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,14}$/
export const GOOGLE_ADS_CONVERSION_ID_PATTERN = /^AW-\d{6,12}$/
export const META_PIXEL_ID_PATTERN = /^\d{5,20}$/

interface IntegrationBase {
    id: string
    providerId: string
}

export interface GtmIntegration extends IntegrationBase {
    type: 'gtm'
    params: { containerId: string }
}

export interface Ga4Integration extends IntegrationBase {
    type: 'ga4'
    params: { measurementId: string; anonymizeIp?: boolean }
}

export interface GoogleAdsIntegration extends IntegrationBase {
    type: 'google-ads'
    params: { conversionId: string }
}

export interface MetaPixelIntegration extends IntegrationBase {
    type: 'meta-pixel'
    params: { pixelId: string }
}

export interface CustomScriptIntegration extends IntegrationBase {
    type: 'custom-script'
    params: { src: string; attrs?: Record<string, string | boolean> }
}

export type IntegrationDescriptor =
    | GtmIntegration
    | Ga4Integration
    | GoogleAdsIntegration
    | MetaPixelIntegration
    | CustomScriptIntegration

export type IntegrationType = IntegrationDescriptor['type']

const GOOGLE_INTEGRATION_TYPES = new Set<IntegrationType>(['gtm', 'ga4', 'google-ads'])

type GoogleConsentSignals = Record<string, 'granted' | 'denied' | number>

function ensureDataLayer(): void {
    globalThis.window.dataLayer = globalThis.window.dataLayer || []
}

function ensureGtag(): void {
    ensureDataLayer()
    if (!globalThis.window.gtag) {
        globalThis.window.gtag = function gtag(): void {
            globalThis.window.dataLayer.push(arguments)
        }
    }
}

/** Attributes that could redirect the script or execute code — never settable via `attrs`. */
const BLOCKED_SCRIPT_ATTRS = /^(src|href|srcdoc)$|^on/i

function injectScriptOnce(src: string, attrs: Record<string, string | boolean> = {}): void {
    const escaped = src.replaceAll('"', String.raw`\"`)
    if (document.querySelector(`script[src="${escaped}"]`)) {
        return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    for (const [name, value] of Object.entries(attrs)) {
        if (value === false || BLOCKED_SCRIPT_ATTRS.test(name)) {
            continue
        }
        script.setAttribute(name, value === true ? '' : value)
    }
    document.head.appendChild(script)
}

/**
 * Category-level Google Consent Mode signals. A category counts as granted
 * only when every non-essential provider assigned to it is granted —
 * fail-closed on partial selections within a category.
 */
export function googleConsentSignalsFor(
    decisions: ConsentDecisions,
    providers: readonly CookieProviderConfig[]
): GoogleConsentSignals {
    const categoryGranted = (category: CookieCategory): boolean => {
        const categoryProviders = providers.filter(provider => provider.category === category)
        return categoryProviders.length > 0 && categoryProviders.every(provider => decisions[provider.id] === true)
    }
    const analytics = categoryGranted('Analytics')
    const functional = categoryGranted('Functional')
    const marketing = categoryGranted('Marketing')
    return {
        analytics_storage: analytics ? 'granted' : 'denied',
        functionality_storage: functional ? 'granted' : 'denied',
        personalization_storage: functional ? 'granted' : 'denied',
        ad_storage: marketing ? 'granted' : 'denied',
        ad_user_data: marketing ? 'granted' : 'denied',
        ad_personalization: marketing ? 'granted' : 'denied',
        security_storage: 'granted'
    }
}

export interface IntegrationApplyContext {
    decisions: ConsentDecisions
    providers: readonly CookieProviderConfig[]
    domain?: string
    cookieDomain?: string
}

/**
 * Per-instance registry (no module singleton). `apply` is idempotent and
 * config-swap safe: descriptors can be replaced at runtime; already injected
 * scripts stay injected (a script cannot be unloaded), but their consent-mode
 * signals are updated and their cookies removed on revocation.
 */
export class IntegrationRegistry {
    private integrations: IntegrationDescriptor[] = []
    private removedIntegrations: IntegrationDescriptor[] = []
    private readonly injected = new Set<string>()
    private readonly lastGranted = new Map<string, boolean>()
    private defaultsPushed = false
    private googleSignalsActive = false

    setIntegrations(integrations: readonly IntegrationDescriptor[] | undefined): void {
        const next = [...(integrations ?? [])]
        const nextIds = new Set(next.map(integration => integration.id))
        // Descriptors that disappear in a config swap must not be orphaned:
        // a previously granted one still needs its revocation when consent
        // changes, and its consent-mode signals must keep being updated.
        for (const previous of this.integrations) {
            if (!nextIds.has(previous.id) && this.lastGranted.get(previous.id) === true) {
                this.removedIntegrations.push(previous)
            }
        }
        this.removedIntegrations = this.removedIntegrations.filter(integration => !nextIds.has(integration.id))
        this.integrations = next
    }

    getIntegrations(): IntegrationDescriptor[] {
        return [...this.integrations]
    }

    apply(context: IntegrationApplyContext): void {
        if (isServer()) {
            return
        }
        const hasGoogleIntegration = this.integrations.some(integration =>
            GOOGLE_INTEGRATION_TYPES.has(integration.type)
        )
        if (hasGoogleIntegration) {
            this.googleSignalsActive = true
        }
        if (this.googleSignalsActive) {
            this.pushConsentModeDefaults()
            ensureGtag()
            globalThis.window.gtag('consent', 'update', googleConsentSignalsFor(context.decisions, context.providers))
        }
        for (const integration of this.removedIntegrations) {
            const provider = context.providers.find(candidate => candidate.id === integration.providerId)
            const granted = provider?.category === 'Essential' || context.decisions[integration.providerId] === true
            if (!granted && this.lastGranted.get(integration.id) === true) {
                this.revoke(integration, provider, context)
                this.lastGranted.set(integration.id, false)
            }
        }
        for (const integration of this.integrations) {
            const provider = context.providers.find(candidate => candidate.id === integration.providerId)
            const granted = provider?.category === 'Essential' || context.decisions[integration.providerId] === true
            const wasGranted = this.lastGranted.get(integration.id) === true
            if (granted && !this.injected.has(integration.id)) {
                this.inject(integration)
                this.injected.add(integration.id)
            } else if (granted && !wasGranted) {
                this.reenable(integration)
            } else if (!granted && wasGranted) {
                this.revoke(integration, provider, context)
            }
            this.lastGranted.set(integration.id, granted)
        }
    }

    /** Re-grant for an already injected tool after a revoke→grant cycle. */
    private reenable(integration: IntegrationDescriptor): void {
        if (integration.type === 'meta-pixel' && globalThis.window.fbq) {
            globalThis.window.fbq('consent', 'grant')
        }
        // Google tools are covered by the consent-mode update pushed above.
    }

    private pushConsentModeDefaults(): void {
        if (this.defaultsPushed) {
            return
        }
        ensureGtag()
        globalThis.window.gtag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted',
            wait_for_update: 500
        })
        this.defaultsPushed = true
    }

    private inject(integration: IntegrationDescriptor): void {
        switch (integration.type) {
            case 'gtm': {
                const { containerId } = integration.params
                if (!GTM_CONTAINER_ID_PATTERN.test(containerId)) {
                    return
                }
                // Deliberately no <noscript> iframe: dynamically injected
                // noscript content DOES load in JS-enabled browsers, firing a
                // googletagmanager request outside Consent Mode — and no-JS
                // visitors never reach this code path anyway.
                ensureGtag()
                globalThis.window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
                injectScriptOnce(`https://www.googletagmanager.com/gtm.js?id=${containerId}`)
                return
            }
            case 'ga4': {
                const { measurementId, anonymizeIp = true } = integration.params
                if (!GA4_MEASUREMENT_ID_PATTERN.test(measurementId)) {
                    return
                }
                ensureGtag()
                injectScriptOnce(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`)
                globalThis.window.gtag('js', new Date())
                globalThis.window.gtag('config', measurementId, { anonymize_ip: anonymizeIp })
                return
            }
            case 'google-ads': {
                const { conversionId } = integration.params
                if (!GOOGLE_ADS_CONVERSION_ID_PATTERN.test(conversionId)) {
                    return
                }
                ensureGtag()
                injectScriptOnce(`https://www.googletagmanager.com/gtag/js?id=${conversionId}`)
                globalThis.window.gtag('js', new Date())
                globalThis.window.gtag('config', conversionId)
                return
            }
            case 'meta-pixel': {
                const { pixelId } = integration.params
                if (!META_PIXEL_ID_PATTERN.test(pixelId)) {
                    return
                }
                this.bootstrapMetaPixel()
                globalThis.window.fbq('consent', 'grant')
                globalThis.window.fbq('init', pixelId)
                globalThis.window.fbq('track', 'PageView')
                return
            }
            case 'custom-script': {
                const { src, attrs } = integration.params
                if (!src.startsWith('https://')) {
                    return
                }
                injectScriptOnce(src, attrs)
                return
            }
        }
    }

    private bootstrapMetaPixel(): void {
        if (globalThis.window.fbq) {
            return
        }
        const fbq: any = (...args: any[]) => {
            if (fbq.callMethod) {
                fbq.callMethod(...args)
            } else {
                fbq.queue.push(args)
            }
        }
        fbq.push = fbq
        fbq.loaded = true
        fbq.version = '2.0'
        fbq.queue = []
        globalThis.window.fbq = fbq
        injectScriptOnce('https://connect.facebook.net/en_US/fbevents.js')
    }

    private revoke(
        integration: IntegrationDescriptor,
        provider: CookieProviderConfig | undefined,
        context: IntegrationApplyContext
    ): void {
        if (integration.type === 'meta-pixel' && globalThis.window.fbq) {
            // A loaded pixel keeps transmitting on SPA navigations until told
            // otherwise — deleting cookies alone is not a revocation.
            globalThis.window.fbq('consent', 'revoke')
        }
        const scope = { domain: context.domain, cookieDomain: context.cookieDomain }
        for (const cookie of provider?.cookies ?? []) {
            removeCookiesMatching(cookie.name, scope)
        }
        const knownCookies: Record<IntegrationType, readonly string[]> = {
            gtm: ['_ga', '_gid', '_ga_*', '_gat_*', '_gcl_*', '_gac_*'],
            ga4: ['_ga', '_gid', '_ga_*', '_gat_*'],
            'google-ads': ['_gcl_*', '_gac_*', '__gads', '__gpi'],
            'meta-pixel': ['_fbp', '_fbc'],
            'custom-script': []
        }
        for (const pattern of knownCookies[integration.type]) {
            removeCookiesMatching(pattern, scope)
        }
    }
}
