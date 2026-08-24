import { getCookieValue } from './consentState'
import { googleConsentSignalsFor, IntegrationDescriptor, IntegrationRegistry } from './integrations'
import { CookieProviderConfig } from './types'

function clearAllCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0]?.trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        }
    }
}

function clearInjectedScripts() {
    for (const node of Array.from(document.querySelectorAll('script[src], noscript'))) {
        node.remove()
    }
}

const gtmProvider: CookieProviderConfig = {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'Analytics',
    description: 'Tag management',
    dataProtectionLink: 'https://policies.google.com/privacy',
    cookies: [{ name: '_ga', duration: 2, unit: 'years', purpose: 'tracking' }]
}

const pixelProvider: CookieProviderConfig = {
    id: 'meta',
    name: 'Meta Pixel',
    category: 'Marketing',
    description: 'Advertising',
    dataProtectionLink: 'https://www.facebook.com/privacy/policy/',
    cookies: [{ name: '_fbp', duration: 90, unit: 'days', purpose: 'ads' }]
}

const customProvider: CookieProviderConfig = {
    id: 'hotjar',
    name: 'Hotjar',
    category: 'Analytics',
    description: 'Heatmaps',
    dataProtectionLink: 'https://www.hotjar.com/privacy/',
    cookies: [{ name: '_hj_*', duration: 30, unit: 'days', purpose: 'heatmaps' }]
}

const providers = [gtmProvider, pixelProvider, customProvider]

const gtmIntegration: IntegrationDescriptor = {
    id: 'int_gtm',
    type: 'gtm',
    providerId: 'gtm',
    params: { containerId: 'GTM-AB12CD' }
}

const pixelIntegration: IntegrationDescriptor = {
    id: 'int_meta',
    type: 'meta-pixel',
    providerId: 'meta',
    params: { pixelId: '1234567890' }
}

const customIntegration: IntegrationDescriptor = {
    id: 'int_hotjar',
    type: 'custom-script',
    providerId: 'hotjar',
    params: { src: 'https://static.example.com/hotjar.js' }
}

function gtmScript(): HTMLScriptElement | null {
    return document.querySelector('script[src*="googletagmanager.com/gtm.js"]')
}

function consentCommands(): { mode: string; signals: Record<string, unknown> }[] {
    const dataLayer: unknown[] = (globalThis as any).window.dataLayer || []
    return dataLayer
        .filter((entry: any) => typeof entry === 'object' && entry !== null && entry[0] === 'consent')
        .map((entry: any) => ({ mode: entry[1], signals: entry[2] }))
}

describe('IntegrationRegistry', () => {
    beforeEach(() => {
        clearAllCookies()
        clearInjectedScripts()
        ;(globalThis as any).window.dataLayer = undefined
        ;(globalThis as any).window.gtag = undefined
        ;(globalThis as any).window.fbq = undefined
    })

    it('does not inject any script without consent (strict loading)', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration, pixelIntegration, customIntegration])

        registry.apply({ decisions: { gtm: false, meta: false, hotjar: false }, providers })

        expect(gtmScript()).toBeNull()
        expect(document.querySelector('script[src*="hotjar"]')).toBeNull()
        expect((globalThis as any).window.fbq).toBeUndefined()
    })

    it('pushes denied Consent Mode defaults before anything else when Google tools are configured', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])

        registry.apply({ decisions: { gtm: false }, providers })

        const commands = consentCommands()
        expect(commands[0].mode).toBe('default')
        expect(commands[0].signals.analytics_storage).toBe('denied')
        expect(commands[0].signals.ad_storage).toBe('denied')
        expect(commands[0].signals.security_storage).toBe('granted')
    })

    it('injects the GTM script only after the provider is granted', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])

        registry.apply({ decisions: { gtm: false }, providers })
        expect(gtmScript()).toBeNull()

        registry.apply({ decisions: { gtm: true }, providers })
        expect(gtmScript()).not.toBeNull()
    })

    it('is idempotent — repeated applies inject a script only once', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])

        registry.apply({ decisions: { gtm: true }, providers })
        registry.apply({ decisions: { gtm: true }, providers })

        expect(document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')).toHaveLength(1)
    })

    it('updates Consent Mode signals from the category decisions', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])

        registry.apply({ decisions: { gtm: true, meta: true, hotjar: true }, providers })

        const updates = consentCommands().filter(command => command.mode === 'update')
        const lastUpdate = updates.at(-1)
        expect(lastUpdate?.signals.analytics_storage).toBe('granted')
        expect(lastUpdate?.signals.ad_storage).toBe('granted')
    })

    it('keeps a category denied while any of its providers is denied', () => {
        expect(googleConsentSignalsFor({ gtm: true, hotjar: false, meta: false }, providers)).toMatchObject({
            analytics_storage: 'denied',
            ad_storage: 'denied'
        })
        expect(googleConsentSignalsFor({ gtm: true, hotjar: true, meta: false }, providers)).toMatchObject({
            analytics_storage: 'granted',
            ad_storage: 'denied'
        })
    })

    it('removes provider cookies on revocation, including wildcard names', () => {
        document.cookie = '_ga=1; path=/'
        document.cookie = '_ga_ABC=1; path=/'
        document.cookie = '_hj_session=1; path=/'

        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration, customIntegration])
        registry.apply({ decisions: { gtm: true, hotjar: true, meta: false }, providers })

        registry.apply({ decisions: { gtm: false, hotjar: false, meta: false }, providers })

        expect(getCookieValue('_ga')).toBeNull()
        expect(getCookieValue('_ga_ABC')).toBeNull()
        expect(getCookieValue('_hj_session')).toBeNull()
    })

    it('bootstraps the Meta Pixel only after marketing consent', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([pixelIntegration])

        registry.apply({ decisions: { meta: false }, providers })
        expect((globalThis as any).window.fbq).toBeUndefined()

        registry.apply({ decisions: { meta: true }, providers })
        expect((globalThis as any).window.fbq).toBeDefined()
        expect(document.querySelector('script[src*="connect.facebook.net"]')).not.toBeNull()
    })

    it('injects custom scripts with attributes after consent', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([
            {
                ...customIntegration,
                params: { src: 'https://static.example.com/hotjar.js', attrs: { defer: true, 'data-x': 'y' } }
            }
        ])

        registry.apply({ decisions: { hotjar: true }, providers })

        const script = document.querySelector('script[src*="hotjar"]')
        expect(script).not.toBeNull()
        expect(script?.getAttribute('data-x')).toBe('y')
        expect(script?.hasAttribute('defer')).toBe(true)
    })

    it('refuses to inject non-https custom scripts', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([{ ...customIntegration, params: { src: 'http://static.example.com/hotjar.js' } }])

        registry.apply({ decisions: { hotjar: true }, providers })

        expect(document.querySelector('script[src*="hotjar"]')).toBeNull()
    })

    it('ignores integrations with invalid tool ids', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([
            { id: 'int_bad', type: 'gtm', providerId: 'gtm', params: { containerId: 'not-valid' } }
        ])

        registry.apply({ decisions: { gtm: true }, providers })

        expect(gtmScript()).toBeNull()
    })

    it('treats essential providers as always granted', () => {
        const essentialCustom: CookieProviderConfig = {
            id: 'self-hosted',
            name: 'Self hosted',
            category: 'Essential',
            description: 'Required',
            dataProtectionLink: 'https://example.com/privacy',
            cookies: []
        }
        const registry = new IntegrationRegistry()
        registry.setIntegrations([
            {
                id: 'int_self',
                type: 'custom-script',
                providerId: 'self-hosted',
                params: { src: 'https://example.com/required.js' }
            }
        ])

        registry.apply({ decisions: {}, providers: [essentialCustom] })

        expect(document.querySelector('script[src="https://example.com/required.js"]')).not.toBeNull()
    })
})

describe('IntegrationRegistry — review fixes', () => {
    beforeEach(() => {
        clearAllCookies()
        clearInjectedScripts()
        ;(globalThis as any).window.dataLayer = undefined
        ;(globalThis as any).window.gtag = undefined
        ;(globalThis as any).window.fbq = undefined
    })

    it('does not grant functionality_storage when only Analytics was consented', () => {
        expect(googleConsentSignalsFor({ gtm: true, hotjar: true, meta: false }, providers)).toMatchObject({
            analytics_storage: 'granted',
            functionality_storage: 'denied',
            personalization_storage: 'denied'
        })
    })

    it('blocks src, srcdoc, href and on* attributes on injected custom scripts', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([
            {
                ...customIntegration,
                params: {
                    src: 'https://static.example.com/hotjar.js',
                    attrs: { src: 'http://attacker.example/evil.js', onerror: 'alert(1)', 'data-ok': 'yes' }
                }
            }
        ])

        registry.apply({ decisions: { hotjar: true }, providers })

        const script = document.querySelector('script[src="https://static.example.com/hotjar.js"]')
        expect(script).not.toBeNull()
        expect(script?.getAttribute('src')).toBe('https://static.example.com/hotjar.js')
        expect(script?.hasAttribute('onerror')).toBe(false)
        expect(script?.getAttribute('data-ok')).toBe('yes')
    })

    it('does not inject a GTM noscript iframe (it would fire outside Consent Mode)', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])

        registry.apply({ decisions: { gtm: true }, providers })

        expect(document.querySelector('noscript')).toBeNull()
        expect(document.querySelector('iframe')).toBeNull()
    })

    it('revokes the Meta Pixel via fbq consent revoke and re-grants on a new consent', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([pixelIntegration])

        registry.apply({ decisions: { meta: true }, providers })
        const calls: any[][] = []
        const fbq = (globalThis as any).window.fbq
        const originalFbq = fbq
        ;(globalThis as any).window.fbq = (...args: any[]) => {
            calls.push(args)
            originalFbq(...args)
        }

        registry.apply({ decisions: { meta: false }, providers })
        expect(calls).toContainEqual(['consent', 'revoke'])

        registry.apply({ decisions: { meta: true }, providers })
        expect(calls).toContainEqual(['consent', 'grant'])
    })

    it('still revokes an integration that was removed in a config swap', () => {
        document.cookie = '_ga=1; path=/'

        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])
        registry.apply({ decisions: { gtm: true, hotjar: false, meta: false }, providers })

        registry.setIntegrations([customIntegration])
        registry.apply({ decisions: { gtm: false, hotjar: false, meta: false }, providers })

        expect(getCookieValue('_ga')).toBeNull()
    })

    it('keeps pushing consent-mode updates after all Google integrations were removed', () => {
        const registry = new IntegrationRegistry()
        registry.setIntegrations([gtmIntegration])
        registry.apply({ decisions: { gtm: true, hotjar: false, meta: false }, providers })

        registry.setIntegrations([])
        registry.apply({ decisions: { gtm: false, hotjar: false, meta: false }, providers })

        const updates = consentCommands().filter(command => command.mode === 'update')
        const lastUpdate = updates.at(-1)
        expect(lastUpdate?.signals.analytics_storage).toBe('denied')
    })
})
