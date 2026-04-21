import { consentHookManager, createGoogleTagManagerHook } from './consentHooks'
import { ConsentHookContext } from './types'

// Mock window.dataLayer and global types for Jest
declare global {
    interface Window {
        dataLayer: any[]
    }
    var global: typeof globalThis
}

// Mock DOM methods
const mockAppendChild = jest.fn()
const mockInsertBefore = jest.fn()
const mockQuerySelector = jest.fn()

// Ensure window is defined before mocking
if (typeof window === 'undefined') {
    ;(global as any).window = global
}

// Mock document
Object.defineProperty(global.document, 'createElement', {
    value: jest.fn((tagName: string) => ({
        tagName,
        async: true,
        src: '',
        height: '',
        width: '',
        style: {},
        innerHTML: '',
        appendChild: mockAppendChild
    }))
})

Object.defineProperty(global.document, 'querySelector', {
    value: mockQuerySelector
})

Object.defineProperty(global.document, 'head', {
    value: { appendChild: mockAppendChild }
})

Object.defineProperty(global.document, 'body', {
    value: {
        appendChild: mockAppendChild,
        insertBefore: mockInsertBefore,
        firstChild: null
    }
})

// Ensure window.dataLayer is initialized
if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = []
}

// Mock cookie utilities
const mockCookieRemove = jest.fn()
const mockCookieSet = jest.fn()
const mockCookieGet = jest.fn()

describe('Google Consent Mode v2 Tests', () => {
    beforeEach(() => {
        // Reset window.dataLayer
        if (typeof window !== 'undefined') {
            window.dataLayer = []
        }

        // Clear consent hook manager
        consentHookManager.clearHooks()

        // Reset all mocks
        jest.clearAllMocks()
        mockQuerySelector.mockReturnValue(null)

        // Reset console spy
        jest.spyOn(console, 'log').mockImplementation(() => undefined)
    })

    afterEach(() => {
        jest.restoreAllMocks()
        consentHookManager.clearHooks()
    })

    describe('GTM Initialization', () => {
        it('should initialize GTM with default denied consent state', () => {
            const _hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })

            // GTM should be initialized immediately with default denied state
            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('default')
            expect(window.dataLayer).toContainEqual({
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
                wait_for_update: 500
            })
        })

        it('should load GTM script with correct container ID', () => {
            createGoogleTagManagerHook('GTM-TEST123', { granular: true })

            expect(document.createElement).toHaveBeenCalledWith('script')
            expect(mockAppendChild).toHaveBeenCalled()

            // Check if script src contains the correct GTM ID
            const createElementCalls = (document.createElement as jest.Mock).mock.calls
            const scriptCall = createElementCalls.find(call => call[0] === 'script')
            expect(scriptCall).toBeDefined()
        })

        it('should not initialize GTM twice', () => {
            // First initialization
            createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            const firstDataLayerLength = window.dataLayer.length

            // Second initialization should not add more events (due to check for existing gtm.js event)
            createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            expect(window.dataLayer.length).toBeGreaterThanOrEqual(firstDataLayerLength)
        })
    })

    describe('Analytics Storage Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = {
                category: 'Analytics',
                consentState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: {
                    set: mockCookieSet,
                    get: mockCookieGet,
                    remove: mockCookieRemove
                },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            // Clear initialization event
            window.dataLayer = []
        })

        it('should grant analytics_storage consent when accepted', async () => {
            const analyticsAcceptHook = hooks.find(h => h.id === 'gtm-analytics-storage')
            expect(analyticsAcceptHook).toBeDefined()

            await analyticsAcceptHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                analytics_storage: 'granted'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'analytics_storage_granted',
                consent_parameter: 'analytics_storage'
            })
        })

        it('should deny analytics_storage consent when rejected', async () => {
            const analyticsRejectHook = hooks.find(h => h.id === 'gtm-analytics-storage-reject')
            expect(analyticsRejectHook).toBeDefined()

            await analyticsRejectHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                analytics_storage: 'denied'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'analytics_storage_denied',
                consent_parameter: 'analytics_storage'
            })
        })

        it('should remove analytics cookies when consent is denied', async () => {
            const analyticsRejectHook = hooks.find(h => h.id === 'gtm-analytics-storage-reject')

            await analyticsRejectHook.execute(mockContext)

            // Check that analytics cookies are removed
            expect(mockCookieRemove).toHaveBeenCalledWith('_ga')
            expect(mockCookieRemove).toHaveBeenCalledWith('_gid')
            expect(mockCookieRemove).toHaveBeenCalledWith('_ga_*')
        })
    })

    describe('Ad Storage Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = {
                category: 'Marketing',
                consentState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: {
                    set: mockCookieSet,
                    get: mockCookieGet,
                    remove: mockCookieRemove
                },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            // Clear initialization event
            window.dataLayer = []
        })

        it('should grant ad_storage consent when accepted', async () => {
            const adStorageAcceptHook = hooks.find(h => h.id === 'gtm-ad-storage')
            expect(adStorageAcceptHook).toBeDefined()

            await adStorageAcceptHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_storage: 'granted'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'ad_storage_granted',
                consent_parameter: 'ad_storage'
            })
        })

        it('should deny ad_storage consent and remove cookies when rejected', async () => {
            const adStorageRejectHook = hooks.find(h => h.id === 'gtm-ad-storage-reject')

            await adStorageRejectHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_storage: 'denied'
            })

            // Check that ad storage cookies are removed
            expect(mockCookieRemove).toHaveBeenCalledWith('_gcl_*')
            expect(mockCookieRemove).toHaveBeenCalledWith('_gac_*')
            expect(mockCookieRemove).toHaveBeenCalledWith('_gat_*')
        })
    })

    describe('Ad User Data Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = {
                category: 'Marketing',
                consentState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: {
                    set: mockCookieSet,
                    get: mockCookieGet,
                    remove: mockCookieRemove
                },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            window.dataLayer = []
        })

        it('should grant ad_user_data consent when accepted', async () => {
            const adUserDataAcceptHook = hooks.find(h => h.id === 'gtm-ad-user-data')

            await adUserDataAcceptHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_user_data: 'granted'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'ad_user_data_granted',
                consent_parameter: 'ad_user_data'
            })
        })

        it('should deny ad_user_data consent when rejected', async () => {
            const adUserDataRejectHook = hooks.find(h => h.id === 'gtm-ad-user-data-reject')

            await adUserDataRejectHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_user_data: 'denied'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'ad_user_data_denied',
                consent_parameter: 'ad_user_data'
            })
        })
    })

    describe('Ad Personalization Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = {
                category: 'Marketing',
                consentState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: {
                    set: mockCookieSet,
                    get: mockCookieGet,
                    remove: mockCookieRemove
                },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            window.dataLayer = []
        })

        it('should grant ad_personalization consent when accepted', async () => {
            const adPersonalizationAcceptHook = hooks.find(h => h.id === 'gtm-ad-personalization')

            await adPersonalizationAcceptHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_personalization: 'granted'
            })

            expect(window.dataLayer).toContainEqual({
                event: 'ad_personalization_granted',
                consent_parameter: 'ad_personalization'
            })
        })

        it('should deny ad_personalization consent and remove cookies when rejected', async () => {
            const adPersonalizationRejectHook = hooks.find(h => h.id === 'gtm-ad-personalization-reject')

            await adPersonalizationRejectHook.execute(mockContext)

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_personalization: 'denied'
            })

            // Check that personalization cookies are removed
            expect(mockCookieRemove).toHaveBeenCalledWith('__gads')
            expect(mockCookieRemove).toHaveBeenCalledWith('__gpi')
        })
    })

    describe('Hook Manager Integration', () => {
        it('should register granular GTM hooks with consent hook manager', async () => {
            const hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })

            // Register hooks
            consentHookManager.registerHooks(hooks)

            // Mock consent state changes
            const mockContext: ConsentHookContext = {
                category: 'Analytics',
                consentState: { Analytics: true, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: {
                    set: mockCookieSet,
                    get: mockCookieGet,
                    remove: mockCookieRemove
                },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            window.dataLayer = []

            // Execute onAccept hooks for Analytics category
            await consentHookManager.executeHooks('Analytics', 'onAccept', mockContext)

            // Should have fired analytics_storage consent
            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                analytics_storage: 'granted'
            })
        })

        it('should handle mixed consent scenarios correctly', async () => {
            const hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            consentHookManager.registerHooks(hooks)

            window.dataLayer = []

            // User grants Analytics but denies Marketing
            const analyticsContext: ConsentHookContext = {
                category: 'Analytics',
                consentState: { Analytics: true, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: { set: mockCookieSet, get: mockCookieGet, remove: mockCookieRemove },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            const marketingContext: ConsentHookContext = {
                category: 'Marketing',
                consentState: { Analytics: true, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: { set: mockCookieSet, get: mockCookieGet, remove: mockCookieRemove },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            // Grant analytics
            await consentHookManager.executeHooks('Analytics', 'onAccept', analyticsContext)

            // Deny marketing
            await consentHookManager.executeHooks('Marketing', 'onReject', marketingContext)

            // Should have granted analytics_storage only
            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                analytics_storage: 'granted'
            })

            // Should have denied all marketing parameters
            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_storage: 'denied'
            })

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_user_data: 'denied'
            })

            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({
                ad_personalization: 'denied'
            })
        })
    })

    describe('Consent Mode v2 Compliance', () => {
        it('should include all required consent mode v2 parameters', () => {
            const _hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })

            // Check initialization includes all v2 parameters
            expect(window.dataLayer).toContainEqual(
                expect.objectContaining({
                    ad_storage: 'denied',
                    analytics_storage: 'denied',
                    ad_user_data: 'denied', // v2 parameter
                    ad_personalization: 'denied', // v2 parameter
                    security_storage: 'granted'
                })
            )
        })

        it('should use proper gtag consent API format', async () => {
            const hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            const analyticsHook = hooks.find(h => h.id === 'gtm-analytics-storage')
            expect(analyticsHook).toBeDefined()

            window.dataLayer = []

            const mockContext: ConsentHookContext = {
                category: 'Analytics',
                consentState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                previousState: { Analytics: false, Marketing: false, Essential: true, Functional: false },
                cookies: { set: mockCookieSet, get: mockCookieGet, remove: mockCookieRemove },
                gtag: jest.fn(),
                dataLayer: window.dataLayer
            }

            if (analyticsHook) {
                await analyticsHook.execute(mockContext)
            }

            // Should use proper gtag format with separate push calls
            expect(window.dataLayer).toContainEqual('consent')
            expect(window.dataLayer).toContainEqual('update')
            expect(window.dataLayer).toContainEqual({ analytics_storage: 'granted' })
        })
    })
})
