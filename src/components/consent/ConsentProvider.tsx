import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConsentHookManager, createCookieUtils } from '../../consentHooks'
import { isServer } from '../../functions'
import { IntegrationRegistry } from '../../integrations'
import { ConsentSnapshot, ConsentStore } from '../../store'
import { ConsentHookContext, CookieCategory, CookieConsentBannerConfig } from '../../types'
import { CookieConsentBanner } from './ConsentBanner'
import { ConsentStateProviderContext } from './context'

interface ConsentProviderProps {
    readonly children: React.ReactNode
    readonly config: CookieConsentBannerConfig
    readonly includeCookieBanner?: boolean
}

const NON_ESSENTIAL_CATEGORIES: readonly CookieCategory[] = ['Functional', 'Analytics', 'Marketing']

/**
 * Legacy consent-hook compatibility: category counts as consented when any of
 * its providers is granted (v1 semantics, kept for the deprecated hook path).
 */
function categoryStates(snapshot: ConsentSnapshot, config: CookieConsentBannerConfig): Record<CookieCategory, boolean> {
    const states: Record<CookieCategory, boolean> = {
        Essential: true,
        Functional: false,
        Analytics: false,
        Marketing: false
    }
    for (const provider of config.providers) {
        if (provider.category !== 'Essential' && snapshot.decisions[provider.id] === true) {
            states[provider.category] = true
        }
    }
    return states
}

export function CookieConsentProvider({
    children,
    config,
    includeCookieBanner = true
}: ConsentProviderProps): React.ReactElement {
    const [store] = useState(() => new ConsentStore(config))
    const registry = useMemo(() => new IntegrationRegistry(), [])
    const hookManager = useMemo(() => new ConsentHookManager(), [])
    const configRef = useRef(config)
    configRef.current = config

    const [isBannerOpen, setIsBannerOpen] = useState<boolean>(() => store.getSnapshot().status !== 'valid')
    const openBanner = useCallback(() => setIsBannerOpen(true), [])

    const executeLegacyHooks = useCallback(
        async (
            type: 'onLoad' | 'onAccept' | 'onReject',
            categories: readonly CookieCategory[],
            consentState: Record<CookieCategory, boolean>,
            previousState?: Record<CookieCategory, boolean>
        ) => {
            const currentConfig = configRef.current
            const context: ConsentHookContext = {
                category: 'Essential',
                consentState,
                previousState,
                cookies: createCookieUtils(currentConfig.domain),
                gtag: (globalThis as any).gtag,
                dataLayer: (globalThis as any).dataLayer
            }
            for (const category of categories) {
                await hookManager.executeHooks(category, type, { ...context, category })
            }
        },
        [hookManager]
    )

    const applyCurrentConfig = useCallback(() => {
        const currentConfig = configRef.current
        store.setConfig(currentConfig)
        registry.setIntegrations(currentConfig.integrations)
        // Register without clearing: registration is idempotent per hook id and
        // preserves the onLoad dedup, so config identity churn never re-fires
        // already executed onLoad hooks.
        if (currentConfig.consentHooks) {
            hookManager.registerHooks(currentConfig.consentHooks)
        }
        const snapshot = store.getSnapshot()
        registry.apply({
            decisions: snapshot.decisions,
            providers: currentConfig.providers,
            domain: currentConfig.domain,
            cookieDomain: currentConfig.cookieDomain
        })
        return snapshot
    }, [store, registry, hookManager])

    // Only material configuration changes re-run the config effect — a parent
    // re-render with an inline config literal must not reset anything.
    const configSignature = useMemo(
        () =>
            JSON.stringify({
                providers: config.providers.map(provider => [provider.id, provider.category]),
                integrations: config.integrations ?? [],
                cookieName: config.cookieName,
                cookieDomain: config.cookieDomain,
                domain: config.domain,
                purposesHash: config.purposesHash
            }),
        [config]
    )
    const bootstrappedRef = useRef(false)

    // Client-side consent bootstrap: migrate v1 cookies, refresh the cookie max
    // age, apply integrations for the stored decision (strict: nothing runs
    // without a valid consent), and execute deprecated onLoad hooks once.
    useEffect(() => {
        if (isServer() || bootstrappedRef.current) {
            return
        }
        bootstrappedRef.current = true
        store.initialize()
        const snapshot = applyCurrentConfig()
        const states = categoryStates(snapshot, configRef.current)
        const consentedCategories = (['Essential', ...NON_ESSENTIAL_CATEGORIES] as CookieCategory[]).filter(
            category => states[category]
        )
        executeLegacyHooks('onLoad', consentedCategories, states)
        setIsBannerOpen(snapshot.status !== 'valid')
    }, [store, applyCurrentConfig, executeLegacyHooks])

    // Material config change at runtime: re-evaluate; re-open the banner when
    // the stored consent no longer covers the configuration, but never
    // force-close a banner the visitor may have opened deliberately.
    // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the material signature by design — raw config identity churn must not re-run this
    useEffect(() => {
        if (isServer() || !bootstrappedRef.current) {
            return
        }
        const snapshot = applyCurrentConfig()
        if (snapshot.status !== 'valid') {
            setIsBannerOpen(true)
        }
    }, [configSignature, applyCurrentConfig])

    // React to consent changes: re-apply integrations, run the deprecated
    // accept/reject hooks on category transitions, and close the banner once a
    // full decision exists (also when made outside the banner UI).
    useEffect(() => {
        return store.subscribe((snapshot, previous) => {
            const currentConfig = configRef.current
            registry.apply({
                decisions: snapshot.decisions,
                providers: currentConfig.providers,
                domain: currentConfig.domain,
                cookieDomain: currentConfig.cookieDomain
            })
            const currentStates = categoryStates(snapshot, currentConfig)
            const previousStates = categoryStates(previous, currentConfig)
            const accepted = NON_ESSENTIAL_CATEGORIES.filter(
                category => currentStates[category] && !previousStates[category]
            )
            const rejected = NON_ESSENTIAL_CATEGORIES.filter(
                category => !currentStates[category] && previousStates[category]
            )
            if (accepted.length > 0) {
                executeLegacyHooks('onAccept', accepted, currentStates, previousStates)
            }
            if (rejected.length > 0) {
                executeLegacyHooks('onReject', rejected, currentStates, previousStates)
            }
            if (snapshot.status === 'valid' && previous.status !== 'valid') {
                setIsBannerOpen(false)
            }
        })
    }, [store, registry, executeLegacyHooks])

    const contextValue = useMemo(
        () => ({
            isBannerOpen,
            setIsBannerOpen,
            openBanner,
            config,
            store
        }),
        [isBannerOpen, openBanner, config, store]
    )

    return (
        <ConsentStateProviderContext.Provider value={contextValue}>
            {children}
            {includeCookieBanner && <CookieConsentBanner />}
        </ConsentStateProviderContext.Provider>
    )
}
