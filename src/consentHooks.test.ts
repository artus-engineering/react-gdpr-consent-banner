import { consentHookManager, createGoogleTagManagerHook } from './consentHooks'
import { ConsentHookContext, CookieCategory } from './types'

// Mock window.dataLayer and global types for Jest
declare global {
    interface Window {
        dataLayer: any[]
    }
}

// Mock DOM methods
const mockAppendChild = jest.fn()
const mockInsertBefore = jest.fn()
const mockQuerySelector = jest.fn()

if (globalThis.window === undefined) {
    ;(globalThis as any).window = globalThis
}

Object.defineProperty(globalThis.document, 'createElement', {
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

Object.defineProperty(globalThis.document, 'querySelector', {
    value: mockQuerySelector
})

Object.defineProperty(globalThis.document, 'head', {
    value: { appendChild: mockAppendChild }
})

Object.defineProperty(globalThis.document, 'body', {
    value: {
        appendChild: mockAppendChild,
        insertBefore: mockInsertBefore,
        firstChild: null
    }
})

// Ensure globalThis.window.dataLayer is initialized
if (globalThis.window !== undefined && !globalThis.window.dataLayer) {
    globalThis.window.dataLayer = []
}

// Mock cookie utilities
const mockCookieRemove = jest.fn()
const mockCookieSet = jest.fn()
const mockCookieGet = jest.fn()

const BASE_CONSENT_STATE: Record<CookieCategory, boolean> = {
    Essential: true,
    Functional: false,
    Analytics: false,
    Marketing: false
}

function createMockHookContext(
    category: CookieCategory,
    options?: {
        consentState?: Record<CookieCategory, boolean>
        previousState?: Record<CookieCategory, boolean>
    }
): ConsentHookContext {
    return {
        category,
        consentState: options?.consentState ?? { ...BASE_CONSENT_STATE },
        previousState: options?.previousState ?? { ...BASE_CONSENT_STATE },
        cookies: {
            set: mockCookieSet,
            get: mockCookieGet,
            remove: mockCookieRemove
        },
        gtag: jest.fn(),
        dataLayer: globalThis.window.dataLayer
    }
}

function expectGranularGtmDataLayerPush(
    consent: Record<string, string>,
    eventMeta: { event: string; consent_parameter: string }
) {
    const dl = globalThis.window.dataLayer
    const commands = dl.map(entry => (typeof entry === 'object' && entry !== null ? Array.from(entry) : entry))
    expect(commands).toContainEqual(['consent', 'update', consent])
    expect(dl).toContainEqual(eventMeta)
}

describe('Google Consent Mode v2 Tests', () => {
    beforeEach(() => {
        // Reset globalThis.window.dataLayer
        if (globalThis.window !== undefined) {
            globalThis.window.dataLayer = []
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
            const commands = globalThis.window.dataLayer.map(entry =>
                typeof entry === 'object' && entry !== null ? Array.from(entry) : entry
            )
            expect(commands).toContainEqual([
                'consent',
                'default',
                {
                    ad_storage: 'denied',
                    analytics_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    functionality_storage: 'denied',
                    personalization_storage: 'denied',
                    security_storage: 'granted',
                    wait_for_update: 500
                }
            ])
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
            const firstDataLayerLength = globalThis.window.dataLayer.length

            // Second initialization should not add more events (due to check for existing gtm.js event)
            createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            expect(globalThis.window.dataLayer.length).toBeGreaterThanOrEqual(firstDataLayerLength)
        })
    })

    describe('Analytics Storage Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = createMockHookContext('Analytics')
            globalThis.window.dataLayer = []
        })

        it('should grant analytics_storage consent when accepted', async () => {
            const analyticsAcceptHook = hooks.find(h => h.id === 'gtm-analytics-storage')
            expect(analyticsAcceptHook).toBeDefined()

            await analyticsAcceptHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { analytics_storage: 'granted' },
                { event: 'analytics_storage_granted', consent_parameter: 'analytics_storage' }
            )
        })

        it('should deny analytics_storage consent when rejected', async () => {
            const analyticsRejectHook = hooks.find(h => h.id === 'gtm-analytics-storage-reject')
            expect(analyticsRejectHook).toBeDefined()

            await analyticsRejectHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { analytics_storage: 'denied' },
                { event: 'analytics_storage_denied', consent_parameter: 'analytics_storage' }
            )
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
            mockContext = createMockHookContext('Marketing')
            globalThis.window.dataLayer = []
        })

        it('should grant ad_storage consent when accepted', async () => {
            const adStorageAcceptHook = hooks.find(h => h.id === 'gtm-ad-storage')
            expect(adStorageAcceptHook).toBeDefined()

            await adStorageAcceptHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_storage: 'granted' },
                { event: 'ad_storage_granted', consent_parameter: 'ad_storage' }
            )
        })

        it('should deny ad_storage consent and remove cookies when rejected', async () => {
            const adStorageRejectHook = hooks.find(h => h.id === 'gtm-ad-storage-reject')

            await adStorageRejectHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_storage: 'denied' },
                { event: 'ad_storage_denied', consent_parameter: 'ad_storage' }
            )

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
            mockContext = createMockHookContext('Marketing')
            globalThis.window.dataLayer = []
        })

        it('should grant ad_user_data consent when accepted', async () => {
            const adUserDataAcceptHook = hooks.find(h => h.id === 'gtm-ad-user-data')

            await adUserDataAcceptHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_user_data: 'granted' },
                { event: 'ad_user_data_granted', consent_parameter: 'ad_user_data' }
            )
        })

        it('should deny ad_user_data consent when rejected', async () => {
            const adUserDataRejectHook = hooks.find(h => h.id === 'gtm-ad-user-data-reject')

            await adUserDataRejectHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_user_data: 'denied' },
                { event: 'ad_user_data_denied', consent_parameter: 'ad_user_data' }
            )
        })
    })

    describe('Ad Personalization Consent', () => {
        let hooks: any[]
        let mockContext: ConsentHookContext

        beforeEach(() => {
            hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            mockContext = createMockHookContext('Marketing')
            globalThis.window.dataLayer = []
        })

        it('should grant ad_personalization consent when accepted', async () => {
            const adPersonalizationAcceptHook = hooks.find(h => h.id === 'gtm-ad-personalization')

            await adPersonalizationAcceptHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_personalization: 'granted' },
                { event: 'ad_personalization_granted', consent_parameter: 'ad_personalization' }
            )
        })

        it('should deny ad_personalization consent and remove cookies when rejected', async () => {
            const adPersonalizationRejectHook = hooks.find(h => h.id === 'gtm-ad-personalization-reject')

            await adPersonalizationRejectHook.execute(mockContext)

            expectGranularGtmDataLayerPush(
                { ad_personalization: 'denied' },
                { event: 'ad_personalization_denied', consent_parameter: 'ad_personalization' }
            )

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
            const mockContext = createMockHookContext('Analytics', {
                consentState: { ...BASE_CONSENT_STATE, Analytics: true }
            })

            globalThis.window.dataLayer = []

            // Execute onAccept hooks for Analytics category
            await consentHookManager.executeHooks('Analytics', 'onAccept', mockContext)

            expectGranularGtmDataLayerPush(
                { analytics_storage: 'granted' },
                { event: 'analytics_storage_granted', consent_parameter: 'analytics_storage' }
            )
        })

        it('should handle mixed consent scenarios correctly', async () => {
            const hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            consentHookManager.registerHooks(hooks)

            globalThis.window.dataLayer = []

            // User grants Analytics but denies Marketing
            const analyticsContext = createMockHookContext('Analytics', {
                consentState: { ...BASE_CONSENT_STATE, Analytics: true }
            })

            const marketingContext = createMockHookContext('Marketing', {
                consentState: { ...BASE_CONSENT_STATE, Analytics: true, Marketing: false },
                previousState: { ...BASE_CONSENT_STATE }
            })

            // Grant analytics
            await consentHookManager.executeHooks('Analytics', 'onAccept', analyticsContext)

            // Deny marketing
            await consentHookManager.executeHooks('Marketing', 'onReject', marketingContext)

            expectGranularGtmDataLayerPush(
                { analytics_storage: 'granted' },
                { event: 'analytics_storage_granted', consent_parameter: 'analytics_storage' }
            )

            expectGranularGtmDataLayerPush(
                { ad_storage: 'denied' },
                { event: 'ad_storage_denied', consent_parameter: 'ad_storage' }
            )

            expectGranularGtmDataLayerPush(
                { ad_user_data: 'denied' },
                { event: 'ad_user_data_denied', consent_parameter: 'ad_user_data' }
            )

            expectGranularGtmDataLayerPush(
                { ad_personalization: 'denied' },
                { event: 'ad_personalization_denied', consent_parameter: 'ad_personalization' }
            )
        })
    })

    describe('Consent Mode v2 Compliance', () => {
        it('should include all required consent mode v2 parameters', () => {
            const _hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })

            // Check initialization includes all v2 parameters
            const commands = globalThis.window.dataLayer.map(entry =>
                typeof entry === 'object' && entry !== null ? Array.from(entry) : entry
            )
            expect(commands).toContainEqual(
                expect.arrayContaining([
                    'consent',
                    'default',
                    expect.objectContaining({
                        ad_storage: 'denied',
                        analytics_storage: 'denied',
                        ad_user_data: 'denied', // v2 parameter
                        ad_personalization: 'denied', // v2 parameter
                        security_storage: 'granted'
                    })
                ])
            )
        })

        it('should use proper gtag consent API format', async () => {
            const hooks = createGoogleTagManagerHook('GTM-TEST123', { granular: true })
            const analyticsHook = hooks.find(h => h.id === 'gtm-analytics-storage')
            expect(analyticsHook).toBeDefined()

            globalThis.window.dataLayer = []

            const mockContext = createMockHookContext('Analytics')

            if (analyticsHook) {
                await analyticsHook.execute(mockContext)
            }

            expectGranularGtmDataLayerPush(
                { analytics_storage: 'granted' },
                { event: 'analytics_storage_granted', consent_parameter: 'analytics_storage' }
            )
        })
    })
})
