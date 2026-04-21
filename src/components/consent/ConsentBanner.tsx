import { type ReactElement, useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { consentHookManager, createCookieUtils } from '../../consentHooks'
import {
    getCookieSelection,
    getLabel,
    getLocalizedCookieText,
    getUnit,
    hexToRGBA,
    persistCookieSelection,
    setCookieConsentDisplayed
} from '../../functions'
import {
    useConfig,
    useCookieConsentContext,
    useCookieProviders,
    useSetStrictlyNecessaryCookiesOnly,
    useStyle
} from '../../hooks'
import { CookieCategory, CookieConsentState, CookieProviderConfig } from '../../types'
import { SwitchButton } from '../general'

const emptySubscribe = () => () => undefined

export function CookieConsentBanner(): ReactElement | null {
    const config = useConfig()
    const style = useStyle()
    const cookieProviders = useCookieProviders()
    const setStrictlyNecessaryCookiesOnly = useSetStrictlyNecessaryCookiesOnly()
    const { isBannerOpen, setIsBannerOpen } = useCookieConsentContext()
    const [showDetails, setShowDetails] = useState<boolean>(false)
    const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())

    // SSR-safe client detection using useSyncExternalStore
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    )

    // Define getCookieConsentState BEFORE it's used
    const getCookieConsentState = useCallback((): CookieConsentState => {
        return cookieProviders.reduce((acc, cookie) => {
            if (!acc[cookie.category]) {
                acc[cookie.category] = {
                    enabled: cookie.category === 'Essential',
                    cookies: {}
                }
            }
            acc[cookie.category].cookies[cookie.id] = cookie.category === 'Essential' || getCookieSelection(cookie)
            acc[cookie.category].enabled = Object.values(acc[cookie.category].cookies).every(value => value)
            return acc
        }, {} as CookieConsentState)
    }, [cookieProviders])

    // Initialize consent state lazily
    const [consentState, setConsentState] = useState<CookieConsentState>(() => {
        if (typeof window === 'undefined') return {} as CookieConsentState
        return getCookieConsentState()
    })

    // Sync consent state with cookie storage when banner opens
    // This is a valid effect: synchronizing React state with external browser cookie storage
    useEffect(() => {
        if (isBannerOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with external cookie storage
            setConsentState(getCookieConsentState())
        }
    }, [isBannerOpen, getCookieConsentState])

    function getSelectionState(cookie: CookieProviderConfig): boolean {
        return consentState[cookie.category].cookies[cookie.id]
    }

    function setSelectedCookies() {
        cookieProviders.forEach(provider => {
            persistCookieSelection(provider, getSelectionState(provider), config.domain, config.cookiesValidForDays)
        })
    }

    function setAllCookiesAccepted() {
        cookieProviders.forEach(cookie => {
            persistCookieSelection(cookie, true, config.domain, config.cookiesValidForDays)
        })
    }

    function handleCategoryToggle(category: string) {
        if (category === 'Essential') return
        setConsentState(prevState => {
            const newEnabledState = !prevState[category as CookieCategory].enabled
            const newCookiesState = Object.keys(prevState[category as CookieCategory].cookies).reduce(
                (acc, cookieId) => {
                    acc[cookieId] = newEnabledState
                    return acc
                },
                {} as { [cookieId: string]: boolean }
            )
            return {
                ...prevState,
                [category]: {
                    enabled: newEnabledState,
                    cookies: newCookiesState
                }
            }
        })
    }

    function handleCookieToggle(category: string, cookieId: string) {
        if (category === 'Essential') return
        setConsentState(prevState => {
            const newCookieState = !prevState[category as CookieCategory].cookies[cookieId]
            const newCookiesState = {
                ...prevState[category as CookieCategory].cookies,
                [cookieId]: newCookieState
            }
            const newEnabledState = Object.values(newCookiesState).every(value => value)
            return {
                ...prevState,
                [category]: {
                    enabled: newEnabledState,
                    cookies: newCookiesState
                }
            }
        })
    }

    async function handleAcceptAll() {
        setAllCookiesAccepted()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)

        // Execute onAccept hooks for all categories
        const cookieUtils = createCookieUtils(config.domain)
        const consentState: Record<CookieCategory, boolean> = {
            Essential: true,
            Functional: false,
            Analytics: false,
            Marketing: false
        }

        // Set all categories to true (accept all)
        cookieProviders.forEach(provider => {
            if (provider.category !== 'Essential') {
                consentState[provider.category as CookieCategory] = true
            }
        })

        const context = {
            category: 'Essential' as CookieCategory,
            consentState,
            cookies: cookieUtils,
            gtag: (window as any).gtag,
            dataLayer: (window as any).dataLayer
        }

        // Execute onAccept hooks for all non-Essential categories
        for (const category of ['Functional', 'Analytics', 'Marketing'] as CookieCategory[]) {
            if (consentState[category]) {
                await consentHookManager.executeHooks(category, 'onAccept', {
                    ...context,
                    category
                })
            }
        }

        setIsBannerOpen(false)
    }

    async function handleRejectAll() {
        setStrictlyNecessaryCookiesOnly()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)

        // Only execute onReject hooks if consent was previously given
        const cookieUtils = createCookieUtils(config.domain)
        const previousConsentState: Record<CookieCategory, boolean> = {
            Essential: true,
            Functional: false,
            Analytics: false,
            Marketing: false
        }

        // Check which categories had previous consent
        cookieProviders.forEach(provider => {
            if (provider.category !== 'Essential') {
                const hadConsent = cookieUtils.get(`${provider.id}_consent`) === 'given'
                previousConsentState[provider.category as CookieCategory] =
                    previousConsentState[provider.category as CookieCategory] || hadConsent
            }
        })

        const context = {
            category: 'Essential' as CookieCategory,
            consentState: previousConsentState,
            cookies: cookieUtils,
            gtag: (window as any).gtag,
            dataLayer: (window as any).dataLayer
        }

        // Only execute onReject hooks for categories that had previous consent
        for (const category of ['Functional', 'Analytics', 'Marketing'] as CookieCategory[]) {
            if (previousConsentState[category]) {
                await consentHookManager.executeHooks(category, 'onReject', {
                    ...context,
                    category
                })
            }
        }

        setIsBannerOpen(false)
    }

    async function handleAcceptSelected() {
        setSelectedCookies()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)

        // Execute hooks based on selected state AND previous state
        const cookieUtils = createCookieUtils(config.domain)

        // Current selections
        const currentConsentState: Record<CookieCategory, boolean> = {
            Essential: true,
            Functional: false,
            Analytics: false,
            Marketing: false
        }

        // Previous consent state
        const previousConsentState: Record<CookieCategory, boolean> = {
            Essential: true,
            Functional: false,
            Analytics: false,
            Marketing: false
        }

        // Build both states
        cookieProviders.forEach(provider => {
            if (provider.category !== 'Essential') {
                const isSelected = getSelectionState(provider)
                currentConsentState[provider.category as CookieCategory] =
                    currentConsentState[provider.category as CookieCategory] || isSelected

                const hadConsent = cookieUtils.get(`${provider.id}_consent`) === 'given'
                previousConsentState[provider.category as CookieCategory] =
                    previousConsentState[provider.category as CookieCategory] || hadConsent
            }
        })

        const context = {
            category: 'Essential' as CookieCategory,
            consentState: currentConsentState,
            cookies: cookieUtils,
            gtag: (window as any).gtag,
            dataLayer: (window as any).dataLayer
        }

        // Execute appropriate hooks based on state changes
        for (const category of ['Functional', 'Analytics', 'Marketing'] as CookieCategory[]) {
            const wasEnabled = previousConsentState[category]
            const isEnabled = currentConsentState[category]

            if (isEnabled && !wasEnabled) {
                // Newly accepted
                await consentHookManager.executeHooks(category, 'onAccept', {
                    ...context,
                    category
                })
            } else if (!isEnabled && wasEnabled) {
                // Newly rejected (was enabled before)
                await consentHookManager.executeHooks(category, 'onReject', {
                    ...context,
                    category
                })
            }
            // If state didn't change (was enabled and still enabled, or was disabled and still disabled), do nothing
        }

        setIsBannerOpen(false)
    }

    function toggleProviderExpanded(providerId: string) {
        setExpandedProviders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(providerId)) {
                newSet.delete(providerId)
            } else {
                newSet.add(providerId)
            }
            return newSet
        })
    }

    function getDomainsText(): string {
        const domains = config.crossSubDomainConsent || [config.domain]
        return domains.join(', ')
    }

    function getCategoriesWithCookies(): [string, { enabled: boolean; cookies: { [cookieId: string]: boolean } }][] {
        return Object.entries(consentState).filter(([, categoryState]) => Object.keys(categoryState.cookies).length > 0)
    }

    if (!isClient || !isBannerOpen) return null

    if (!showDetails) {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    zIndex: 50,
                    maxWidth: '896px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                    backgroundColor: style.bgPrimary,
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                <div style={{ padding: '16px 20px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h2
                            style={{
                                color: style.textPrimary,
                                fontSize: '16px',
                                fontWeight: 600,
                                lineHeight: 1.3,
                                margin: 0
                            }}
                        >
                            {getLabel('headings', 'banner', config)}
                        </h2>
                        <p
                            style={{
                                color: style.textSecondary,
                                fontSize: '13px',
                                lineHeight: 1.5,
                                marginTop: '6px',
                                marginBottom: 0
                            }}
                        >
                            {getLabel('descriptions', 'cookieDetails', config)}{' '}
                            <a
                                href={config.cookiePolicyLink}
                                style={{
                                    color: style.primaryColor,
                                    textDecoration: 'underline',
                                    fontWeight: 500
                                }}
                            >
                                {getLabel('links', 'cookiePolicy', config)}
                            </a>
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowDetails(true)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                color: style.textSecondary,
                                backgroundColor: 'transparent'
                            }}
                            onFocus={e => {
                                e.currentTarget.style.outline = `2px solid ${style.primaryColor}`
                                e.currentTarget.style.outlineOffset = '2px'
                            }}
                            onBlur={e => {
                                e.currentTarget.style.outline = 'none'
                            }}
                        >
                            {getLabel('buttons', 'showDetails', config)}
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={handleRejectAll}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    borderRadius: '6px',
                                    border: `1px solid ${hexToRGBA(style.textPrimary, 0.25)}`,
                                    cursor: 'pointer',
                                    color: style.textPrimary,
                                    backgroundColor: 'transparent'
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.outline = `2px solid ${style.primaryColor}`
                                    e.currentTarget.style.outlineOffset = '2px'
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.outline = 'none'
                                }}
                            >
                                {getLabel('buttons', 'rejectAllNonNecessaryCookies', config)}
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptAll}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: style.buttonText,
                                    backgroundColor: style.primaryColor
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.outline = `2px solid ${style.primaryColor}`
                                    e.currentTarget.style.outlineOffset = '2px'
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.outline = 'none'
                                }}
                            >
                                {getLabel('buttons', 'acceptAllCookies', config)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop closes details on overlay click
        <div
            role="presentation"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={e => {
                if (e.target === e.currentTarget) setShowDetails(false)
            }}
        >
            <div
                style={{
                    backgroundColor: style.bgPrimary,
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    maxWidth: '720px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h2
                            style={{
                                color: style.textPrimary,
                                fontSize: '18px',
                                fontWeight: 600,
                                margin: 0
                            }}
                        >
                            {getLabel('headings', 'details', config)}
                        </h2>
                        <p style={{ color: style.textSecondary, fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                            {config.lang === 'deDE' ? 'Ihre Zustimmung gilt für: ' : 'Your consent applies to: '}
                            <span style={{ fontWeight: 600, color: style.textPrimary }}>{getDomainsText()}</span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {getCategoriesWithCookies().map(([category, categoryState]) => {
                            const categoryProviders = cookieProviders.filter(p => p.category === category)

                            return (
                                <div
                                    key={category}
                                    style={{
                                        backgroundColor: hexToRGBA(style.bgSecondary, 0.1),
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        border: `1px solid ${hexToRGBA(style.bgSecondary, 0.2)}`
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h3
                                                style={{
                                                    color: style.textPrimary,
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    margin: 0
                                                }}
                                            >
                                                {getLabel('cookieCategories', category as CookieCategory, config)}
                                            </h3>
                                            <p
                                                style={{
                                                    color: style.textSecondary,
                                                    fontSize: '12px',
                                                    lineHeight: 1.4,
                                                    margin: '4px 0 0 0'
                                                }}
                                            >
                                                {getLabel(
                                                    'cookieCategoryDescriptions',
                                                    category as CookieCategory,
                                                    config
                                                )}
                                            </p>
                                        </div>
                                        <div style={{ flexShrink: 0 }}>
                                            <SwitchButton
                                                bgTrue={style.primaryColor}
                                                bgFalse={style.bgSecondary}
                                                toggled={categoryState.enabled}
                                                onToggle={() => handleCategoryToggle(category)}
                                                name={`category-${category}`}
                                                disabled={category === 'Essential'}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        {categoryProviders.map(provider => {
                                            const isExpanded = expandedProviders.has(provider.id)
                                            const isEnabled = categoryState.cookies[provider.id]

                                            return (
                                                <div
                                                    key={provider.id}
                                                    style={{
                                                        borderTop: `1px solid ${hexToRGBA(style.bgSecondary, 0.2)}`,
                                                        paddingTop: '10px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <h4
                                                                style={{
                                                                    color: style.textPrimary,
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    margin: 0
                                                                }}
                                                            >
                                                                {provider.name}
                                                            </h4>
                                                            <p
                                                                style={{
                                                                    color: style.textSecondary,
                                                                    fontSize: '12px',
                                                                    lineHeight: 1.4,
                                                                    margin: '2px 0 0 0'
                                                                }}
                                                            >
                                                                {getLocalizedCookieText(
                                                                    provider.description,
                                                                    config.lang
                                                                )}{' '}
                                                                <a
                                                                    href={provider.dataProtectionLink}
                                                                    style={{
                                                                        color: style.primaryColor,
                                                                        textDecoration: 'underline',
                                                                        fontWeight: 500
                                                                    }}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {getLabel('details', 'privacyPolicyOf', config)}{' '}
                                                                    {provider.serviceProvider || provider.name}
                                                                </a>
                                                            </p>
                                                        </div>
                                                        <div style={{ flexShrink: 0 }}>
                                                            <SwitchButton
                                                                bgTrue={style.primaryColor}
                                                                bgFalse={style.bgSecondary}
                                                                toggled={isEnabled}
                                                                onToggle={() =>
                                                                    handleCookieToggle(category, provider.id)
                                                                }
                                                                name={provider.id}
                                                                disabled={category === 'Essential'}
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleProviderExpanded(provider.id)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            marginTop: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: 500,
                                                            color: style.primaryColor,
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: '2px 0',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <span>
                                                            {getLabel('details', 'expandCookieDetails', config)}
                                                        </span>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2.5}
                                                            stroke="currentColor"
                                                            style={{
                                                                width: '12px',
                                                                height: '12px',
                                                                transform: isExpanded
                                                                    ? 'rotate(180deg)'
                                                                    : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        >
                                                            <title>Toggle details</title>
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {isExpanded && (
                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns:
                                                                    'repeat(auto-fill, minmax(200px, 1fr))',
                                                                gap: '8px',
                                                                marginTop: '8px',
                                                                animation: 'fadeIn 0.2s ease-out'
                                                            }}
                                                        >
                                                            {provider.cookies.map(cookie => (
                                                                <div
                                                                    key={cookie.name}
                                                                    style={{
                                                                        padding: '8px 10px',
                                                                        borderRadius: '6px',
                                                                        border: `1px solid ${hexToRGBA(style.bgSecondary, 0.3)}`,
                                                                        backgroundColor: hexToRGBA(style.bgPrimary, 0.3)
                                                                    }}
                                                                >
                                                                    <p
                                                                        style={{
                                                                            color: style.textPrimary,
                                                                            fontSize: '11px',
                                                                            fontWeight: 600,
                                                                            margin: '0 0 6px 0'
                                                                        }}
                                                                    >
                                                                        {getLocalizedCookieText(
                                                                            cookie.purpose,
                                                                            config.lang
                                                                        )}
                                                                    </p>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '3px'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                fontSize: '10px'
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    color: style.textSecondary,
                                                                                    fontWeight: 500
                                                                                }}
                                                                            >
                                                                                {getLabel(
                                                                                    'details',
                                                                                    'cookieName',
                                                                                    config
                                                                                )}
                                                                            </span>
                                                                            <span
                                                                                style={{
                                                                                    color: style.textPrimary,
                                                                                    fontFamily: 'monospace'
                                                                                }}
                                                                            >
                                                                                {cookie.name}
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                fontSize: '10px'
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    color: style.textSecondary,
                                                                                    fontWeight: 500
                                                                                }}
                                                                            >
                                                                                {getLabel(
                                                                                    'details',
                                                                                    'cookieDuration',
                                                                                    config
                                                                                )}
                                                                            </span>
                                                                            <span style={{ color: style.textPrimary }}>
                                                                                {cookie.duration}{' '}
                                                                                {getUnit(
                                                                                    cookie.duration,
                                                                                    cookie.unit,
                                                                                    config
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                fontSize: '10px'
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    color: style.textSecondary,
                                                                                    fontWeight: 500
                                                                                }}
                                                                            >
                                                                                {getLabel(
                                                                                    'details',
                                                                                    'cookieAccessors',
                                                                                    config
                                                                                )}
                                                                            </span>
                                                                            <span
                                                                                style={{
                                                                                    color: style.textPrimary,
                                                                                    textAlign: 'right',
                                                                                    maxWidth: '60%'
                                                                                }}
                                                                            >
                                                                                {(
                                                                                    cookie.accessors || [provider.name]
                                                                                ).join(', ')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 24px',
                        borderTop: `1px solid ${hexToRGBA(style.bgSecondary, 0.2)}`
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setShowDetails(false)}
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            color: style.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                    >
                        {getLabel('buttons', 'back', config)}
                    </button>

                    <button
                        type="button"
                        onClick={handleAcceptSelected}
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            color: style.buttonText,
                            backgroundColor: style.primaryColor
                        }}
                    >
                        {getLabel('buttons', 'acceptSelectedCookies', config)}
                    </button>
                </div>
            </div>
        </div>
    )
}
