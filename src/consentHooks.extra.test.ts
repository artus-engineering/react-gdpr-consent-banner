import {
    ConsentHookManager,
    consentHookManager,
    createCookieUtils,
    createCustomToolHook,
    createFacebookPixelHook,
    createGoogleAdsHook,
    createGoogleAnalyticsHook,
    createGoogleTagManagerHook,
    createGranularGoogleTagManagerHook
} from './consentHooks'
import { ConsentHookContext, CookieCategory } from './types'

const BASE_CONSENT_STATE: Record<CookieCategory, boolean> = {
    Essential: true,
    Functional: false,
    Analytics: false,
    Marketing: false
}

function createMockContext(
    category: CookieCategory = 'Essential',
    overrides: Partial<ConsentHookContext> = {}
): ConsentHookContext {
    return {
        category,
        consentState: { ...BASE_CONSENT_STATE },
        cookies: {
            set: jest.fn(),
            get: jest.fn(),
            remove: jest.fn()
        },
        gtag: jest.fn(),
        dataLayer: [],
        ...overrides
    }
}

function clearAllCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0]?.trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        }
    }
}

describe('ConsentHookManager', () => {
    let manager: ConsentHookManager

    beforeEach(() => {
        manager = new ConsentHookManager()
    })

    it('registers and returns hooks', () => {
        const hook = {
            id: 'my-hook',
            category: 'Analytics' as CookieCategory,
            type: 'onAccept' as const,
            execute: jest.fn()
        }

        manager.registerHook(hook)
        expect(manager.getHooks()).toEqual([hook])
    })

    it('registers multiple hooks at once', () => {
        const hooks = [
            { id: 'a', category: 'Analytics' as CookieCategory, type: 'onAccept' as const, execute: jest.fn() },
            { id: 'b', category: 'Marketing' as CookieCategory, type: 'onReject' as const, execute: jest.fn() }
        ]

        manager.registerHooks(hooks)
        expect(manager.getHooks()).toHaveLength(2)
    })

    it('only executes hooks matching the category and type', async () => {
        const analyticsAccept = jest.fn()
        const analyticsReject = jest.fn()
        const marketingAccept = jest.fn()

        manager.registerHooks([
            {
                id: 'analytics-accept',
                category: 'Analytics',
                type: 'onAccept',
                execute: analyticsAccept
            },
            {
                id: 'analytics-reject',
                category: 'Analytics',
                type: 'onReject',
                execute: analyticsReject
            },
            {
                id: 'marketing-accept',
                category: 'Marketing',
                type: 'onAccept',
                execute: marketingAccept
            }
        ])

        const context = createMockContext('Analytics')
        await manager.executeHooks('Analytics', 'onAccept', context)

        expect(analyticsAccept).toHaveBeenCalledWith(context)
        expect(analyticsReject).not.toHaveBeenCalled()
        expect(marketingAccept).not.toHaveBeenCalled()
    })

    it('skips duplicate onLoad executions for the same hook/category', async () => {
        const execute = jest.fn()
        manager.registerHook({ id: 'loader', category: 'Analytics', type: 'onLoad', execute })

        const context = createMockContext('Analytics')
        await manager.executeHooks('Analytics', 'onLoad', context)
        await manager.executeHooks('Analytics', 'onLoad', context)

        expect(execute).toHaveBeenCalledTimes(1)
    })

    it('allows re-running onAccept hooks multiple times', async () => {
        const execute = jest.fn()
        manager.registerHook({ id: 'accept', category: 'Analytics', type: 'onAccept', execute })

        const context = createMockContext('Analytics')
        await manager.executeHooks('Analytics', 'onAccept', context)
        await manager.executeHooks('Analytics', 'onAccept', context)

        expect(execute).toHaveBeenCalledTimes(2)
    })

    it('swallows errors thrown by individual hooks', async () => {
        const faulty = jest.fn().mockRejectedValue(new Error('boom'))
        const ok = jest.fn()
        manager.registerHooks([
            { id: 'faulty', category: 'Analytics', type: 'onAccept', execute: faulty },
            { id: 'ok', category: 'Analytics', type: 'onAccept', execute: ok }
        ])

        const context = createMockContext('Analytics')
        await expect(manager.executeHooks('Analytics', 'onAccept', context)).resolves.toBeUndefined()
        expect(ok).toHaveBeenCalled()
    })

    it('clearHooks empties the registry and execution tracking', async () => {
        const execute = jest.fn()
        manager.registerHook({ id: 'loader', category: 'Analytics', type: 'onLoad', execute })

        const context = createMockContext('Analytics')
        await manager.executeHooks('Analytics', 'onLoad', context)
        expect(execute).toHaveBeenCalledTimes(1)

        manager.clearHooks()
        expect(manager.getHooks()).toEqual([])

        manager.registerHook({ id: 'loader', category: 'Analytics', type: 'onLoad', execute })
        await manager.executeHooks('Analytics', 'onLoad', context)
        expect(execute).toHaveBeenCalledTimes(2)
    })
})

describe('createCookieUtils', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    it('sets and reads cookies with the default path', () => {
        const utils = createCookieUtils()
        utils.set('hello', 'world')
        expect(utils.get('hello')).toBe('world')
    })

    it('returns null for unknown cookies', () => {
        const utils = createCookieUtils()
        expect(utils.get('does_not_exist')).toBeNull()
    })

    it('removes cookies by setting an expired date', () => {
        const utils = createCookieUtils()
        utils.set('to_remove', 'value')
        expect(utils.get('to_remove')).toBe('value')

        utils.remove('to_remove')
        expect(utils.get('to_remove')).toBeNull()
    })

    it('respects the expires option', () => {
        const utils = createCookieUtils()
        utils.set('with_expires', 'v', { expires: 1 })
        expect(document.cookie).toContain('with_expires=v')
    })
})

describe('createGoogleTagManagerHook (standard)', () => {
    beforeEach(() => {
        ;(globalThis.window as any).dataLayer = []
        consentHookManager.clearHooks()
    })

    it('returns category-level accept/reject hooks', () => {
        const hooks = createGoogleTagManagerHook('GTM-ABC123')
        const ids = hooks.map(h => h.id)
        expect(ids).toEqual(
            expect.arrayContaining([
                'google-tag-manager-analytics-accept',
                'google-tag-manager-analytics-reject',
                'google-tag-manager-marketing-accept',
                'google-tag-manager-marketing-reject'
            ])
        )
    })

    it('does not initialize when the GTM id is invalid', () => {
        ;(globalThis.window as any).dataLayer = []
        createGoogleTagManagerHook('not-a-valid-id')
        expect((globalThis.window as any).dataLayer).not.toContainEqual(
            expect.objectContaining({ ad_storage: 'denied' })
        )
    })

    it('pushes granted analytics consent on the standard analytics-accept hook', async () => {
        const hooks = createGoogleTagManagerHook('GTM-ABC123')
        ;(globalThis.window as any).dataLayer = []
        const acceptHook = hooks.find(h => h.id === 'google-tag-manager-analytics-accept')!

        await acceptHook.execute(createMockContext('Analytics'))

        expect((globalThis.window as any).dataLayer).toContainEqual({
            analytics_storage: 'granted',
            functionality_storage: 'granted'
        })
        expect((globalThis.window as any).dataLayer).toContainEqual({ event: 'analytics_consent_granted' })
    })

    it('removes analytics and marketing cookies on reject', async () => {
        const hooks = createGoogleTagManagerHook('GTM-ABC123')
        const analyticsReject = hooks.find(h => h.id === 'google-tag-manager-analytics-reject')!
        const marketingReject = hooks.find(h => h.id === 'google-tag-manager-marketing-reject')!

        const analyticsContext = createMockContext('Analytics')
        const marketingContext = createMockContext('Marketing')

        await analyticsReject.execute(analyticsContext)
        expect(analyticsContext.cookies.remove).toHaveBeenCalledWith('_ga')
        expect(analyticsContext.cookies.remove).toHaveBeenCalledWith('_gid')

        await marketingReject.execute(marketingContext)
        expect(marketingContext.cookies.remove).toHaveBeenCalledWith('_gat')
        expect(marketingContext.cookies.remove).toHaveBeenCalledWith('_fbp')
    })

    it('createGranularGoogleTagManagerHook produces granular hooks', () => {
        const hooks = createGranularGoogleTagManagerHook('GTM-ABC123')
        expect(hooks.some(h => h.id === 'gtm-analytics-storage')).toBe(true)
        expect(hooks.some(h => h.id === 'gtm-ad-storage-reject')).toBe(true)
    })
})

describe('createGoogleAnalyticsHook', () => {
    beforeEach(() => {
        ;(globalThis.window as any).dataLayer = []
        ;(globalThis.window as any).gtag = undefined
    })

    it('returns the expected set of hooks', () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        expect(hooks.map(h => h.id)).toEqual([
            'google-analytics-initialize',
            'google-analytics-analytics-accept',
            'google-analytics-analytics-reject',
            'google-analytics-marketing-accept',
            'google-analytics-marketing-reject'
        ])
    })

    it('initialize hook sets the gtag function and default consent state', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        const initHook = hooks[0]
        await initHook.execute(createMockContext('Essential'))

        expect(typeof (globalThis.window as any).gtag).toBe('function')
        ;(globalThis.window as any).gtag('test', 'payload')
        expect((globalThis.window as any).dataLayer).toContainEqual(['test', 'payload'])
    })

    it('analytics accept hook grants analytics_storage via gtag', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        const acceptHook = hooks.find(h => h.id === 'google-analytics-analytics-accept')!
        const gtag = jest.fn()
        ;(globalThis.window as any).gtag = gtag

        await acceptHook.execute(createMockContext('Analytics'))

        expect(gtag).toHaveBeenCalledWith('consent', 'update', {
            analytics_storage: 'granted',
            functionality_storage: 'granted'
        })
    })

    it('analytics reject hook denies and clears ga cookies', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        const rejectHook = hooks.find(h => h.id === 'google-analytics-analytics-reject')!
        const gtag = jest.fn()
        ;(globalThis.window as any).gtag = gtag

        const ctx = createMockContext('Analytics')
        await rejectHook.execute(ctx)

        expect(gtag).toHaveBeenCalledWith('consent', 'update', {
            analytics_storage: 'denied',
            functionality_storage: 'denied'
        })
        expect(ctx.cookies.remove).toHaveBeenCalledWith('_ga')
        expect(ctx.cookies.remove).toHaveBeenCalledWith('_gid')
    })

    it('marketing accept hook grants ad-related consent parameters', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        const acceptHook = hooks.find(h => h.id === 'google-analytics-marketing-accept')!
        const gtag = jest.fn()
        ;(globalThis.window as any).gtag = gtag

        await acceptHook.execute(createMockContext('Marketing'))

        expect(gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        })
    })

    it('marketing reject hook denies ad consent and removes cookies', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        const rejectHook = hooks.find(h => h.id === 'google-analytics-marketing-reject')!
        const gtag = jest.fn()
        ;(globalThis.window as any).gtag = gtag

        const ctx = createMockContext('Marketing')
        await rejectHook.execute(ctx)

        expect(gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        })
        expect(ctx.cookies.remove).toHaveBeenCalledWith('_gat')
    })

    it('hooks are safe when gtag is not available', async () => {
        const hooks = createGoogleAnalyticsHook('G-123')
        ;(globalThis.window as any).gtag = undefined

        for (const hook of hooks.slice(1)) {
            await expect(hook.execute(createMockContext('Analytics'))).resolves.toBeUndefined()
        }
    })
})

describe('createGoogleAdsHook', () => {
    it('uses context.gtag to update consent on accept', async () => {
        const [acceptHook] = createGoogleAdsHook('AW-123')
        const ctx = createMockContext('Marketing')
        await acceptHook.execute(ctx)

        expect(ctx.gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        })
        expect(ctx.gtag).toHaveBeenCalledWith('config', 'AW-123')
    })

    it('does not call gtag config when no conversionId is provided', async () => {
        const [acceptHook] = createGoogleAdsHook()
        const ctx = createMockContext('Marketing')
        await acceptHook.execute(ctx)

        const gtagMock = ctx.gtag as jest.Mock
        expect(gtagMock.mock.calls.some(call => call[0] === 'config')).toBe(false)
    })

    it('denies consent on reject', async () => {
        const hooks = createGoogleAdsHook()
        const rejectHook = hooks.find(h => h.id === 'google-ads-reject')!
        const ctx = createMockContext('Marketing')
        await rejectHook.execute(ctx)

        expect(ctx.gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        })
    })

    it('is safe when gtag is not available', async () => {
        const hooks = createGoogleAdsHook('AW-123')
        const ctx = createMockContext('Marketing', { gtag: undefined })
        for (const hook of hooks) {
            await expect(hook.execute(ctx)).resolves.toBeUndefined()
        }
    })
})

describe('createFacebookPixelHook', () => {
    beforeEach(() => {
        ;(globalThis as any).fbq = undefined
    })

    it('returns onLoad and onReject hooks', () => {
        const hooks = createFacebookPixelHook('123456')
        expect(hooks.map(h => h.id)).toEqual(['facebook-pixel-load', 'facebook-pixel-reject'])
    })

    it('does nothing on load when marketing consent is not granted', async () => {
        const [loadHook] = createFacebookPixelHook('123456')
        await loadHook.execute(createMockContext('Marketing'))
        expect((globalThis as any).fbq).toBeUndefined()
    })

    it('removes facebook cookies on reject', async () => {
        const hooks = createFacebookPixelHook('123456')
        const rejectHook = hooks.find(h => h.id === 'facebook-pixel-reject')!
        const ctx = createMockContext('Marketing')

        await rejectHook.execute(ctx)

        expect(ctx.cookies.remove).toHaveBeenCalledWith('_fbp')
        expect(ctx.cookies.remove).toHaveBeenCalledWith('_fbc')
        expect(ctx.cookies.remove).toHaveBeenCalledWith('fr')
    })
})

describe('createCustomToolHook', () => {
    it('returns only the hooks for the provided callbacks', () => {
        const onLoad = jest.fn()
        const onAccept = jest.fn()
        const hooks = createCustomToolHook('my-tool', 'Analytics', { onLoad, onAccept })
        expect(hooks.map(h => h.id)).toEqual(['my-tool-load', 'my-tool-accept'])
    })

    it('wires each callback to the right hook type', async () => {
        const onLoad = jest.fn()
        const onAccept = jest.fn()
        const onReject = jest.fn()
        const hooks = createCustomToolHook('my-tool', 'Marketing', {
            onLoad,
            onAccept,
            onReject,
            description: 'custom'
        })

        const ctx = createMockContext('Marketing')
        for (const hook of hooks) {
            await hook.execute(ctx)
            expect(hook.description).toBe('custom')
            expect(hook.category).toBe('Marketing')
        }

        expect(onLoad).toHaveBeenCalledWith(ctx)
        expect(onAccept).toHaveBeenCalledWith(ctx)
        expect(onReject).toHaveBeenCalledWith(ctx)
    })

    it('returns an empty array when no callbacks are provided', () => {
        expect(createCustomToolHook('empty', 'Analytics', {})).toEqual([])
    })
})
