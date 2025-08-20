import { isServer } from './functions'
import { ConsentHook, ConsentHookContext, CookieCategory, GoogleConsentMapping, GoogleConsentState } from './types'

declare global {
    interface Window {
        dataLayer: any[]
        gtag: (...args: any[]) => void
        fbq: any
        _paq: any[]
        hbspt: any
    }
}

/**
 * Consent Hook Manager - Scalable system for handling consent-driven code execution
 */
export class ConsentHookManager {
    private hooks: Map<string, ConsentHook> = new Map()
    private executedHooks: Set<string> = new Set()

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
        hooks.forEach(hook => this.registerHook(hook))
    }

    /**
     * Execute hooks for a specific category and type
     */
    async executeHooks(category: CookieCategory, type: ConsentHook['type'], context: ConsentHookContext): Promise<void> {
        const relevantHooks = Array.from(this.hooks.values()).filter(hook => hook.category === category && hook.type === type)

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
                // Silently handle errors in production
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

            const expiresDate = options.expires ? new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000) : undefined
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
            execute: async (context: ConsentHookContext) => {
                // Always initialize the script, but with denied consent by default
                if (!window.gtag) {
                    window.dataLayer = window.dataLayer || []
                    window.gtag = function gtag(...args) {
                        window.dataLayer.push(args)
                    }

                    const script = document.createElement('script')
                    script.async = true
                    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
                    document.head.appendChild(script)
                }

                // Set default consent state (all denied initially)
                window.gtag('consent', 'default', {
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
                window.gtag('config', measurementId, {
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
            execute: async (context: ConsentHookContext) => {
                if (window.gtag) {
                    window.gtag('consent', 'update', {
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
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        analytics_storage: 'denied',
                        functionality_storage: 'denied'
                    })
                }

                // Remove analytics cookies only
                const analyticsCookies = ['_ga', '_gid']
                analyticsCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })
            }
        },
        {
            id: 'google-analytics-marketing-accept',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Enable Google Analytics marketing features (audiences, remarketing)',
            execute: async (context: ConsentHookContext) => {
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                    })

                    // Enable marketing features in GA4
                    window.gtag('config', measurementId, {
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
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                    })

                    // Disable marketing features in GA4
                    window.gtag('config', measurementId, {
                        allow_google_signals: false,
                        allow_ad_personalization_signals: false
                    })
                }

                // Remove marketing-related cookies
                const marketingCookies = ['_gat', '_ga_*']
                marketingCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })
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
                if (!(window as any).fbq) {
                    const script = document.createElement('script')
                    script.async = true
                    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
                    document.head.appendChild(script)
                    ;(window as any).fbq = (...args: any[]) => {
                        ;(window as any).fbq.callMethod ? (window as any).fbq.callMethod.apply((window as any).fbq, args) : (window as any).fbq.queue.push(args)
                    }
                    ;(window as any).fbq.push = (window as any).fbq
                    ;(window as any).fbq.loaded = true
                    ;(window as any).fbq.version = '2.0'
                    ;(window as any).fbq.queue = []
                }
                ;(window as any).fbq('init', pixelId)
                ;(window as any).fbq('track', 'PageView')
            }
        },
        {
            id: 'facebook-pixel-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Disable Facebook Pixel when marketing consent is rejected',
            execute: async (context: ConsentHookContext) => {
                // Remove Facebook cookies
                const cookiesToRemove = ['_fbp', '_fbc', 'fr']
                cookiesToRemove.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                    context.cookies.remove(cookie, { domain: '.facebook.com' })
                })
            }
        }
    ]
}

/**
 * Google Tag Manager consent hook with granular consent control for individual parameters
 * This properly implements Google Consent Mode v2 through GTM dataLayer
 * Each consent parameter can be controlled individually by the user
 */
export function createGoogleTagManagerHook(gtmId: string): ConsentHook[] {
    // Initialize GTM immediately on page load with default denied consent
    // This is the correct implementation according to Google's documentation
    const initializeGTM = () => {
        if (window.dataLayer?.find((item: any) => item.event === 'gtm.js')) {
            return // Already initialized
        }

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || []

        // CRITICAL: Set default consent state BEFORE loading GTM
        // This ensures GTM respects consent from the very beginning
        window.dataLayer.push('consent', 'default', {
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
            const script = document.createElement('script')
            script.async = true
            script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
            document.head.appendChild(script)

            // Add noscript fallback
            const existingNoscript = document.querySelector(`noscript iframe[src*="googletagmanager.com/ns.html?id=${gtmId}"]`)
            if (!existingNoscript) {
                const noscript = document.createElement('noscript')
                noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
                document.body.appendChild(noscript)
            }
        }


    }

    // Initialize GTM immediately (this should run before any consent hooks)
    if (typeof window !== 'undefined') {
        initializeGTM()
    }

    return [
        {
            id: 'google-tag-manager-analytics-accept',
            category: 'Analytics',
            type: 'onAccept',
            description: 'Grant analytics consent in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []
                // Use proper gtag consent API as per Google documentation
                window.dataLayer.push('consent', 'update', {
                    analytics_storage: 'granted',
                    functionality_storage: 'granted'
                })

                // Fire custom event for GTM triggers
                window.dataLayer.push({
                    event: 'analytics_consent_granted'
                })
            }
        },
        {
            id: 'google-tag-manager-analytics-reject',
            category: 'Analytics',
            type: 'onReject',
            description: 'Deny analytics consent in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []
                // Use proper gtag consent API as per Google documentation
                window.dataLayer.push('consent', 'update', {
                    analytics_storage: 'denied',
                    functionality_storage: 'denied'
                })

                // Fire custom event for GTM triggers
                window.dataLayer.push({
                    event: 'analytics_consent_denied'
                })

                // Remove analytics cookies
                const analyticsCookies = ['_ga', '_gid', '_ga_*']
                analyticsCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })
            }
        },
        {
            id: 'google-tag-manager-marketing-accept',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Grant marketing consent in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []
                // Use proper gtag consent API with consent mode v2 parameters
                window.dataLayer.push('consent', 'update', {
                    ad_storage: 'granted',
                    ad_user_data: 'granted',
                    ad_personalization: 'granted'
                })

                // Fire custom event for marketing triggers
                window.dataLayer.push({
                    event: 'marketing_consent_granted'
                })
            }
        },
        {
            id: 'google-tag-manager-marketing-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Deny marketing consent in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []
                // Use proper gtag consent API with consent mode v2 parameters
                window.dataLayer.push('consent', 'update', {
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied'
                })

                // Fire custom event for marketing triggers
                window.dataLayer.push({
                    event: 'marketing_consent_denied'
                })

                // Remove marketing cookies
                const marketingCookies = ['_gat', '_gcl_*', '_fbp', '_fbc']
                marketingCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })
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

/**
 * Granular Google Tag Manager consent hook with individual parameter control
 * This allows users to grant/deny each consent parameter individually:
 * - analytics_storage (Analytics category)
 * - ad_storage, ad_user_data, ad_personalization (Marketing category - separate providers)
 */
export function createGranularGoogleTagManagerHook(gtmId: string): ConsentHook[] {
    // Initialize GTM immediately on page load with default denied consent
    const initializeGTM = () => {
        if (window.dataLayer?.find((item: any) => item.event === 'gtm.js')) {
            return // Already initialized
        }

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || []

        // CRITICAL: Set default consent state BEFORE loading GTM
        window.dataLayer.push('consent', 'default', {
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
            const script = document.createElement('script')
            script.async = true
            script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
            document.head.appendChild(script)

            // Add noscript fallback
            const existingNoscript = document.querySelector(`noscript iframe[src*="googletagmanager.com/ns.html?id=${gtmId}"]`)
            if (!existingNoscript) {
                const noscript = document.createElement('noscript')
                noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
                document.body.appendChild(noscript)
            }
        }


    }

    // Initialize GTM immediately
    if (typeof window !== 'undefined') {
        initializeGTM()
    }

    return [
        // Analytics Storage (analytics_storage) - Individual parameter
        {
            id: 'gtm-analytics-storage',
            category: 'Analytics',
            type: 'onAccept',
            description: 'Grant analytics_storage consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    analytics_storage: 'granted'
                })

                window.dataLayer.push({
                    event: 'analytics_storage_granted',
                    consent_parameter: 'analytics_storage'
                })


            }
        },
        {
            id: 'gtm-analytics-storage-reject',
            category: 'Analytics',
            type: 'onReject',
            description: 'Deny analytics_storage consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    analytics_storage: 'denied'
                })

                window.dataLayer.push({
                    event: 'analytics_storage_denied',
                    consent_parameter: 'analytics_storage'
                })

                // Remove analytics cookies
                const analyticsCookies = ['_ga', '_gid', '_ga_*']
                analyticsCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })


            }
        },

        // Ad Storage (ad_storage) - Individual parameter
        {
            id: 'gtm-ad-storage',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Grant ad_storage consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_storage: 'granted'
                })

                window.dataLayer.push({
                    event: 'ad_storage_granted',
                    consent_parameter: 'ad_storage'
                })


            }
        },
        {
            id: 'gtm-ad-storage-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Deny ad_storage consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_storage: 'denied'
                })

                window.dataLayer.push({
                    event: 'ad_storage_denied',
                    consent_parameter: 'ad_storage'
                })

                // Remove ad storage cookies
                const adCookies = ['_gcl_*', '_gac_*', '_gat_*']
                adCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })


            }
        },

        // Ad User Data (ad_user_data) - Individual parameter
        {
            id: 'gtm-ad-user-data',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Grant ad_user_data consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_user_data: 'granted'
                })

                window.dataLayer.push({
                    event: 'ad_user_data_granted',
                    consent_parameter: 'ad_user_data'
                })


            }
        },
        {
            id: 'gtm-ad-user-data-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Deny ad_user_data consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_user_data: 'denied'
                })

                window.dataLayer.push({
                    event: 'ad_user_data_denied',
                    consent_parameter: 'ad_user_data'
                })


            }
        },

        // Ad Personalization (ad_personalization) - Individual parameter
        {
            id: 'gtm-ad-personalization',
            category: 'Marketing',
            type: 'onAccept',
            description: 'Grant ad_personalization consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_personalization: 'granted'
                })

                window.dataLayer.push({
                    event: 'ad_personalization_granted',
                    consent_parameter: 'ad_personalization'
                })


            }
        },
        {
            id: 'gtm-ad-personalization-reject',
            category: 'Marketing',
            type: 'onReject',
            description: 'Deny ad_personalization consent parameter in GTM',
            execute: async (context: ConsentHookContext) => {
                window.dataLayer = window.dataLayer || []

                window.dataLayer.push('consent', 'update', {
                    ad_personalization: 'denied'
                })

                window.dataLayer.push({
                    event: 'ad_personalization_denied',
                    consent_parameter: 'ad_personalization'
                })

                // Remove personalization cookies
                const personalizationCookies = ['__gads', '__gpi']
                personalizationCookies.forEach(cookie => {
                    context.cookies.remove(cookie)
                    context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
                })


            }
        }
    ]
}
