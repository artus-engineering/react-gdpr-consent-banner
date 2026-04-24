import { isServer } from './functions'
import { ConsentHook, ConsentHookContext, CookieCategory } from './types'

declare global {
    interface Window {
        dataLayer: any[]
        gtag: (...args: any[]) => void
        fbq: any
        _paq: any[]
        hbspt: any
    }
}

const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/
type GtmConsentMode = 'default' | 'update'
type GtmConsentValue = 'granted' | 'denied'
type GtmConsentUpdate = Record<string, GtmConsentValue | number>
type GtmConsentEventMeta = {
    event: string
    consent_parameter?: string
}

function isValidGtmContainerId(id: string): boolean {
    return GTM_CONTAINER_ID_PATTERN.test(id)
}

function ensureWindowDataLayer(): void {
    globalThis.window.dataLayer = globalThis.window.dataLayer || []
}

function ensureWindowGtag(): void {
    ensureWindowDataLayer()
    if (!globalThis.window.gtag) {
        globalThis.window.gtag = function gtag(): void {
            globalThis.window.dataLayer.push(arguments)
        }
    }
}

function pushGtmConsentCommand(mode: GtmConsentMode, consentUpdate: GtmConsentUpdate): void {
    ensureWindowGtag()
    globalThis.window.gtag('consent', mode, consentUpdate)
}

function pushGtmDataLayerConsent(consentUpdate: GtmConsentUpdate, eventMeta: GtmConsentEventMeta): void {
    pushGtmConsentCommand('update', consentUpdate)
    globalThis.window.dataLayer.push(eventMeta)
}

function removeConsentCookiesForHostname(
    context: ConsentHookContext,
    cookieNames: readonly string[],
    additionalCookieDomains: readonly string[] = []
): void {
    const hostDomain = `.${globalThis.window.location.hostname}`
    for (const name of cookieNames) {
        context.cookies.remove(name)
        context.cookies.remove(name, { domain: hostDomain })
        for (const domain of additionalCookieDomains) {
            context.cookies.remove(name, { domain })
        }
    }
}

type GranularGtmConsentKey = 'analytics_storage' | 'ad_storage' | 'ad_user_data' | 'ad_personalization'

type GranularGtmDefinition = {
    idSuffix: string
    category: CookieCategory
    consentKey: GranularGtmConsentKey
    rejectCookieNames?: readonly string[]
}

const GRANULAR_GTM_HOOK_DEFINITIONS: readonly GranularGtmDefinition[] = [
    {
        idSuffix: 'analytics-storage',
        category: 'Analytics',
        consentKey: 'analytics_storage',
        rejectCookieNames: ['_ga', '_gid', '_ga_*']
    },
    {
        idSuffix: 'ad-storage',
        category: 'Marketing',
        consentKey: 'ad_storage',
        rejectCookieNames: ['_gcl_*', '_gac_*', '_gat_*']
    },
    { idSuffix: 'ad-user-data', category: 'Marketing', consentKey: 'ad_user_data' },
    {
        idSuffix: 'ad-personalization',
        category: 'Marketing',
        consentKey: 'ad_personalization',
        rejectCookieNames: ['__gads', '__gpi']
    }
]

function createGranularGtmHooks(): ConsentHook[] {
    const hooks: ConsentHook[] = []
    for (const def of GRANULAR_GTM_HOOK_DEFINITIONS) {
        const { consentKey, category, idSuffix } = def
        const grantedEvent = `${consentKey}_granted`
        const deniedEvent = `${consentKey}_denied`
        hooks.push(
            {
                id: `gtm-${idSuffix}`,
                category,
                type: 'onAccept',
                description: `Grant ${consentKey} consent parameter in GTM`,
                execute: async () => {
                    pushGtmDataLayerConsent(
                        { [consentKey]: 'granted' },
                        { event: grantedEvent, consent_parameter: consentKey }
                    )
                }
            },
            {
                id: `gtm-${idSuffix}-reject`,
                category,
                type: 'onReject',
                description: `Deny ${consentKey} consent parameter in GTM`,
                execute: async (context: ConsentHookContext) => {
                    pushGtmDataLayerConsent(
                        { [consentKey]: 'denied' },
                        { event: deniedEvent, consent_parameter: consentKey }
                    )
                    if (def.rejectCookieNames?.length) {
                        removeConsentCookiesForHostname(context, def.rejectCookieNames)
                    }
                }
            }
        )
    }
    return hooks
}

/**
 * Consent Hook Manager - Scalable system for handling consent-driven code execution
 */
export class ConsentHookManager {
    private readonly hooks: Map<string, ConsentHook> = new Map()
    private readonly executedHooks: Set<string> = new Set()

    /**
     * Register a consent hook
     */
    registerHook(hook: ConsentHook): void {
        this.hooks.set(hook.id, hook)
    }

    /**
     * Register multiple consent hooks
     */
    registerHooks(hooks: ConsentHook[]): void {
        hooks.forEach(hook => {
            this.registerHook(hook)
        })
    }

    /**
     * Execute hooks for a specific category and type
     */
    async executeHooks(
        category: CookieCategory,
        type: ConsentHook['type'],
        context: ConsentHookContext
    ): Promise<void> {
        const relevantHooks = Array.from(this.hooks.values()).filter(
            hook => hook.category === category && hook.type === type
        )

        for (const hook of relevantHooks) {
            try {
                const hookId = `${hook.id}-${type}-${category}`

                // Prevent duplicate execution for onLoad hooks
                if (type === 'onLoad' && this.executedHooks.has(hookId)) {
                    continue
                }

                await hook.execute(context)

                if (type === 'onLoad') {
                    this.executedHooks.add(hookId)
                }
            } catch (error) {
                // Log errors in development
                if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
                    console.error('[ConsentHook] Error executing hook:', {
                        hookId: hook.id,
                        type,
                        category,
                        error
                    })
                }
            }
        }
    }

    /**
     * Get all registered hooks for debugging
     */
    getHooks(): ConsentHook[] {
        return Array.from(this.hooks.values())
    }

    /**
     * Clear all hooks (useful for testing)
     */
    clearHooks(): void {
        this.hooks.clear()
        this.executedHooks.clear()
    }
}

/**
 * Global consent hook manager instance
 */
export const consentHookManager = new ConsentHookManager()

/**
 * Create cookie utilities for the consent hook context
 */
export function createCookieUtils(domain?: string) {
    return {
        set: (name: string, value: string, options: { expires?: number; domain?: string; path?: string } = {}) => {
            if (isServer()) return

            const expiresDate = options.expires
                ? new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000)
                : undefined
            const cookieDomain = options.domain || domain
            const path = options.path || '/'

            let cookieString = `${name}=${value}; path=${path}`
            if (expiresDate) cookieString += `; expires=${expiresDate.toUTCString()}`
            if (cookieDomain) cookieString += `; domain=${cookieDomain}`

            document.cookie = cookieString
        },
        get: (name: string) => {
            if (isServer()) return null

            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(';').shift() || null
            return null
        },
        remove: (name: string, options: { domain?: string; path?: string } = {}) => {
            if (isServer()) return

            const cookieDomain = options.domain || domain
            const path = options.path || '/'

            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
            if (cookieDomain) cookieString += `; domain=${cookieDomain}`

            document.cookie = cookieString
        }
    }
}

/**
 * Built-in consent hooks for common tools
 */

/**
 * Google Analytics 4 consent hook with granular consent control
 * This properly implements Google Consent Mode v2 by separating analytics and marketing consent
 */
export function createGoogleAnalyticsHook(
    measurementId: string,
    options?: {
        anonymizeIp?: boolean
        cookieFlags?: string
    }
): ConsentHook[] {
    const { anonymizeIp = true, cookieFlags = 'SameSite=Strict;Secure' } = options || {}

    return [
        {
            id: 'google-analytics-initialize',
            category: 'Essential',
            type: 'onLoad',
            description: 'Initialize Google Analytics script with default denied consent',
            execute: async (_context: ConsentHookContext) => {
                // Always initialize the script, but with denied consent by default
                if (!globalThis.window.gtag) {
                    ensureWindowDataLayer()
                    globalThis.window.gtag = function gtag(): void {
                        globalThis.window.dataLayer.push(arguments)
                    }

                    const script = document.createElement('script')
                    script.async = true
                    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
                    document.head.appendChild(script)
                }

                // Set default consent state (all denied initially)
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

                // Configure GA4 with basic settings (no data collection until consent)
                globalThis.window.gtag('config', measurementId, {
                    anonymize_ip: anonymizeIp,
                    cookie_flags: cookieFlags,
                    allow_google_signals: false, // Disabled until marketing consent
                    allow_ad_personalization_signals: false // Disabled until marketing consent
                })
            }
        },
        {
            id: 'google-analytics-analytics-accept',
            category: 'Analytics',
            type: 'onAccept',
            description: 'Enable Google Analytics data collection for analytics purposes',
            execute: async (_context: ConsentHookContext) => {
                if (globalThis.window.gtag) {
                    globalThis.window.gtag('consent', 'update', {
                        analytics_storage: 'granted',
                        functionality_storage: 'granted'
                    })
                }
            }
        },
        {
            id: 'google-analytics-analytics-reject',
            category: 'Analytics',
            type: 'onReject',
            description: 'Disable Google Analytics data collection',
            execute: async (context: ConsentHookContext) => {
                if (globalThis.window.gtag) {
                    globalThis.window.gtag('consent', 'update', {
                        analytics_storage: 'denied',
                        functionality_storage: 'denied'
                    })
                }

                removeConsentCookiesForHostname(context, ['_ga', '_gid'])
            }
        },
        {
            id: 'google-analytics-marketing-accept',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Enable Google Analytics marketing features (audiences, remarketing)',
            execute: async (_context: ConsentHookContext) => {
                if (globalThis.window.gtag) {
                    globalThis.window.gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                    })

                    // Enable marketing features in GA4
                    globalThis.window.gtag('config', measurementId, {
                        allow_google_signals: true,
                        allow_ad_personalization_signals: true
                    })
                }
            }
        },
        {
            id: 'google-analytics-marketing-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Disable Google Analytics marketing features',
            execute: async (context: ConsentHookContext) => {
                if (globalThis.window.gtag) {
                    globalThis.window.gtag('consent', 'update', {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                    })

                    // Disable marketing features in GA4
                    globalThis.window.gtag('config', measurementId, {
                        allow_google_signals: false,
                        allow_ad_personalization_signals: false
                    })
                }

                removeConsentCookiesForHostname(context, ['_gat', '_ga_*'])
            }
        }
    ]
}

/**
 * Google Ads consent hook
 */
export function createGoogleAdsHook(conversionId?: string): ConsentHook[] {
    return [
        {
            id: 'google-ads-accept',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Enable Google Ads tracking when marketing consent is given',
            execute: async (context: ConsentHookContext) => {
                if (context.gtag) {
                    context.gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                    })

                    if (conversionId) {
                        context.gtag('config', conversionId)
                    }
                }
            }
        },
        {
            id: 'google-ads-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Disable Google Ads tracking when marketing consent is rejected',
            execute: async (context: ConsentHookContext) => {
                if (context.gtag) {
                    context.gtag('consent', 'update', {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                    })
                }
            }
        }
    ]
}

/**
 * Facebook Pixel consent hook
 */
export function createFacebookPixelHook(pixelId: string): ConsentHook[] {
    return [
        {
            id: 'facebook-pixel-load',
            category: 'Marketing',
            type: 'onLoad',
            description: 'Initialize Facebook Pixel when page loads with consent',
            execute: async (context: ConsentHookContext) => {
                if (!context.consentState.Marketing) return

                // Initialize Facebook Pixel
                if (!(globalThis as any).fbq) {
                    const script = document.createElement('script')
                    script.async = true
                    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
                    document.head.appendChild(script)
                    ;(globalThis as any).fbq = (...args: any[]) => {
                        if ((globalThis as any).fbq.callMethod) {
                            ;(globalThis as any).fbq.callMethod(...args)
                        } else {
                            ;(globalThis as any).fbq.queue.push(args)
                        }
                    }
                    ;(globalThis as any).fbq.push = (globalThis as any).fbq
                    ;(globalThis as any).fbq.loaded = true
                    ;(globalThis as any).fbq.version = '2.0'
                    ;(globalThis as any).fbq.queue = []
                }
                ;(globalThis as any).fbq('init', pixelId)
                ;(globalThis as any).fbq('track', 'PageView')
            }
        },
        {
            id: 'facebook-pixel-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Disable Facebook Pixel when marketing consent is rejected',
            execute: async (context: ConsentHookContext) => {
                removeConsentCookiesForHostname(context, ['_fbp', '_fbc', 'fr'], ['.facebook.com'])
            }
        }
    ]
}

/**
 * Google Tag Manager consent hook with granular consent control for individual parameters
 * This properly implements Google Consent Mode v2 through GTM dataLayer
 * Each consent parameter can be controlled individually by the user
 */
export function createGoogleTagManagerHook(
    gtmId: string,
    options?: {
        granular?: boolean
    }
): ConsentHook[] {
    const { granular = false } = options || {}

    // Initialize GTM immediately on page load with default denied consent
    // This is the correct implementation according to Google's documentation
    const initializeGTM = () => {
        if (globalThis.window === undefined || globalThis.document === undefined) {
            return // Not in browser environment
        }

        if (!isValidGtmContainerId(gtmId)) {
            return
        }

        if (globalThis.window.dataLayer?.find((item: any) => item.event === 'gtm.js')) {
            return // Already initialized
        }

        ensureWindowGtag()

        // CRITICAL: Set default consent state BEFORE loading GTM
        // This ensures GTM respects consent from the very beginning
        pushGtmConsentCommand('default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted',
            wait_for_update: 500
        })

        // Load GTM script
        const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)
        if (!existingScript) {
            globalThis.window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

            const script = document.createElement('script')
            script.async = true
            script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
            document.head.appendChild(script)

            // Add noscript fallback
            const existingNoscript = document.querySelector(
                `noscript iframe[src*="googletagmanager.com/ns.html?id=${gtmId}"]`
            )
            if (!existingNoscript) {
                const noscript = document.createElement('noscript')
                const iframe = document.createElement('iframe')
                iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`
                iframe.height = '0'
                iframe.width = '0'
                iframe.style.display = 'none'
                iframe.style.visibility = 'hidden'
                noscript.appendChild(iframe)
                document.body.appendChild(noscript)
            }
        }
    }

    // Initialize GTM immediately (this should run before any consent hooks)
    if (globalThis.window !== undefined && globalThis.document !== undefined) {
        initializeGTM()
    }

    if (granular) {
        return createGranularGtmHooks()
    }

    // Standard consent control - category-based
    return [
        {
            id: 'google-tag-manager-analytics-accept',
            category: 'Analytics',
            type: 'onAccept',
            description: 'Grant analytics consent in GTM',
            execute: async (_context: ConsentHookContext) => {
                pushGtmDataLayerConsent(
                    {
                        analytics_storage: 'granted',
                        functionality_storage: 'granted'
                    },
                    { event: 'analytics_consent_granted' }
                )
            }
        },
        {
            id: 'google-tag-manager-analytics-reject',
            category: 'Analytics',
            type: 'onReject',
            description: 'Deny analytics consent in GTM',
            execute: async (context: ConsentHookContext) => {
                pushGtmDataLayerConsent(
                    {
                        analytics_storage: 'denied',
                        functionality_storage: 'denied'
                    },
                    { event: 'analytics_consent_denied' }
                )
                removeConsentCookiesForHostname(context, ['_ga', '_gid', '_ga_*'])
            }
        },
        {
            id: 'google-tag-manager-marketing-accept',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Grant marketing consent in GTM',
            execute: async (_context: ConsentHookContext) => {
                pushGtmDataLayerConsent(
                    {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                    },
                    { event: 'marketing_consent_granted' }
                )
            }
        },
        {
            id: 'google-tag-manager-marketing-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Deny marketing consent in GTM',
            execute: async (context: ConsentHookContext) => {
                pushGtmDataLayerConsent(
                    {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                    },
                    { event: 'marketing_consent_denied' }
                )
                removeConsentCookiesForHostname(context, ['_gat', '_gcl_*', '_fbp', '_fbc'])
            }
        }
    ]
}

/**
 * Generic consent hook for custom tools
 */
export function createCustomToolHook(
    id: string,
    category: CookieCategory,
    config: {
        onLoad?: (context: ConsentHookContext) => void | Promise<void>
        onAccept?: (context: ConsentHookContext) => void | Promise<void>
        onReject?: (context: ConsentHookContext) => void | Promise<void>
        description?: string
    }
): ConsentHook[] {
    const hooks: ConsentHook[] = []

    if (config.onLoad) {
        hooks.push({
            id: `${id}-load`,
            category,
            type: 'onLoad',
            description: config.description || `Load hook for ${id}`,
            execute: config.onLoad
        })
    }

    if (config.onAccept) {
        hooks.push({
            id: `${id}-accept`,
            category,
            type: 'onAccept',
            description: config.description || `Accept hook for ${id}`,
            execute: config.onAccept
        })
    }

    if (config.onReject) {
        hooks.push({
            id: `${id}-reject`,
            category,
            type: 'onReject',
            description: config.description || `Reject hook for ${id}`,
            execute: config.onReject
        })
    }

    return hooks
}

// Legacy function names for backward compatibility
export const createGranularGoogleTagManagerHook = (gtmId: string) =>
    createGoogleTagManagerHook(gtmId, { granular: true })
