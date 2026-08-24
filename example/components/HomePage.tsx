'use client'

import { CheckCircle2, Globe, Lock, Palette, Settings2, Shield, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@/components/LocaleProvider'
import { LicenseNotice, SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { consentLangByLocale } from '@/lib/i18n/config'
import { getPrivacyPath } from '@/lib/i18n/paths'
import { CookieConsentGate, CookieConsentProvider } from '../../src/components/consent'
import { useCookieConsentContext, useCookieProviders } from '../../src/hooks'
import { CookieConsentStyle } from '../../src/types'

// Component to open the banner (must be inside CookieConsentProvider)
function OpenBannerButton({ label }: { label: string }) {
    const { setIsBannerOpen } = useCookieConsentContext()

    return (
        <Button onClick={() => setIsBannerOpen(true)} size="lg">
            <Settings2 className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}

function StripeCheckoutConsentGateDemo({
    paymentPossible,
    paymentDescription
}: {
    paymentPossible: string
    paymentDescription: string
}) {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true)
    }, [])

    const providers = useCookieProviders('StripeCheckoutConsentGateDemo')
    const stripe = useMemo(() => providers.find(p => p.id === 'stripe'), [providers])
    if (!stripe) {
        return null
    }
    if (!isClient) {
        return <div className="min-h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
    }
    return (
        <CookieConsentGate cookieProvider={stripe}>
            <div className="rounded-xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/50 p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
                <p className="font-medium text-slate-800">{paymentPossible}</p>
                <p className="mt-1 text-sm text-slate-600">{paymentDescription}</p>
            </div>
        </CookieConsentGate>
    )
}

// Preset themes - professional and subtle
const presetThemes: Record<string, CookieConsentStyle> = {
    light: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        primaryColor: '#3b82f6',
        buttonText: '#ffffff'
    },
    dark: {
        bgPrimary: '#1e293b',
        bgSecondary: '#334155',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        primaryColor: '#60a5fa',
        buttonText: '#1e293b'
    },
    neutral: {
        bgPrimary: '#fafafa',
        bgSecondary: '#f4f4f5',
        textPrimary: '#27272a',
        textSecondary: '#71717a',
        primaryColor: '#52525b',
        buttonText: '#ffffff'
    },
    warm: {
        bgPrimary: '#fffbeb',
        bgSecondary: '#fef3c7',
        textPrimary: '#451a03',
        textSecondary: '#78350f',
        primaryColor: '#d97706',
        buttonText: '#ffffff'
    }
}

export function HomePage() {
    const { locale, dictionary } = useLocale()
    const h = dictionary.home
    const colorLabels = h.colorLabels
    const presetLabels = h.presetLabels
    const [customTheme, setCustomTheme] = useState<CookieConsentStyle>(presetThemes.light)
    const [themeKey, setThemeKey] = useState(0)

    // Normalize hex color to ensure it's valid
    const normalizeHexColor = (color: string): string => {
        if (!color) return '#000000'

        // Remove any whitespace
        color = color.trim()

        // If it's already a valid 6-digit hex, return it uppercase
        if (/^#[0-9A-Fa-f]{6}$/i.test(color)) {
            return color.toUpperCase()
        }

        // If it's a 3-digit hex, expand it
        if (/^#[0-9A-Fa-f]{3}$/i.test(color)) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase()
        }

        // If it doesn't start with #, try to add it
        if (!color.startsWith('#')) {
            const withHash = `#${color}`
            // Check if it's valid after adding #
            if (/^#[0-9A-Fa-f]{6}$/i.test(withHash)) {
                return withHash.toUpperCase()
            }
            if (/^#[0-9A-Fa-f]{3}$/i.test(withHash)) {
                return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`.toUpperCase()
            }
        }

        // If invalid, try to extract valid hex from the string
        const hexMatch = color.match(/#?[0-9A-Fa-f]{6}/)
        if (hexMatch) {
            const matched = hexMatch[0]
            return matched.startsWith('#') ? matched.toUpperCase() : `#${matched}`.toUpperCase()
        }

        // Last resort: return the original if it looks like it might be valid, otherwise default
        return color.length > 0 ? color : '#000000'
    }

    const handleColorChange = (key: keyof CookieConsentStyle, value: string) => {
        const normalizedColor = normalizeHexColor(value)
        setCustomTheme(prev => ({ ...prev, [key]: normalizedColor }))
        setThemeKey(k => k + 1)
    }

    const handlePresetChange = (presetName: string) => {
        setCustomTheme(presetThemes[presetName])
        setThemeKey(k => k + 1)
    }

    const demoDomain =
        process.env.NEXT_PUBLIC_DEMO_DOMAIN ?? (typeof window !== 'undefined' ? window.location.hostname : 'localhost')

    const config = {
        cookiePolicyLink: getPrivacyPath(locale),
        websiteName: h.websiteName,
        domain: demoDomain,
        crossSubDomainConsent: ['tebuto.de', 'app.tebuto.de', 'termin.tebuto.de', 'link.tebuto.de'],
        cookiesValidForDays: 365,
        lang: consentLangByLocale[locale],
        theme: customTheme,
        providers: [
            {
                id: 'tebuto-session',
                name: 'Tebuto',
                category: 'Essential' as const,
                description: {
                    deDE: 'Wir verwenden Session-Cookies, um Ihre Sitzung auf unserer Website zu speichern. Dieses Cookie ist notwendig, um die Website zu nutzen.',
                    enUS: 'We use session cookies to store your session on our website. This cookie is necessary to use the website.'
                },
                dataProtectionLink: 'https://tebuto.de/datenschutz',
                serviceProvider: 'Tebuto',
                cookies: [
                    {
                        name: 'tebuto_session',
                        duration: 1,
                        unit: 'session' as const,
                        purpose: {
                            deDE: 'Speichert die Sitzung des Benutzers',
                            enUS: 'Stores the user session'
                        }
                    }
                ]
            },
            {
                id: 'stripe',
                name: 'Stripe',
                category: 'Functional' as const,
                description: {
                    deDE: 'Wir verwenden Stripe, um Zahlungen auf unserer Website abzuwickeln. Wenn Sie die App nutzen möchten, müssen Sie diesem Cookie zustimmen.',
                    enUS: 'We use Stripe to process payments on our website. If you want to use the app, you must consent to this cookie.'
                },
                dataProtectionLink: 'https://stripe.com/privacy',
                serviceProvider: 'Stripe',
                cookies: [
                    {
                        name: '__stripe_mid',
                        duration: 1,
                        unit: 'years' as const,
                        purpose: {
                            deDE: 'Betrugsprävention',
                            enUS: 'Fraud prevention'
                        }
                    },
                    {
                        name: '__stripe_sid',
                        duration: 30,
                        unit: 'days' as const,
                        purpose: {
                            deDE: 'Betrugsprävention',
                            enUS: 'Fraud prevention'
                        }
                    }
                ]
            },
            {
                id: 'google-analytics',
                name: 'Google Analytics',
                category: 'Analytics' as const,
                description: {
                    deDE: 'Wir verwenden Google Analytics, um zu verstehen, wie Besucher mit unserer Website interagieren.',
                    enUS: 'We use Google Analytics to understand how visitors interact with our website.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                serviceProvider: 'Google',
                cookies: [
                    {
                        name: '_ga',
                        duration: 2,
                        unit: 'years' as const,
                        purpose: {
                            deDE: 'Wird verwendet, um Benutzer zu unterscheiden',
                            enUS: 'Used to distinguish users'
                        }
                    },
                    {
                        name: '_gid',
                        duration: 1,
                        unit: 'days' as const,
                        purpose: {
                            deDE: 'Wird verwendet, um Benutzer zu unterscheiden',
                            enUS: 'Used to distinguish users'
                        }
                    }
                ]
            },
            {
                id: 'google-ads',
                name: 'Google',
                category: 'Marketing' as const,
                description: {
                    deDE: 'Wir verwenden Google Ads, um Ihnen relevante Werbung zu zeigen.',
                    enUS: 'We use Google Ads to show you relevant advertisements.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                serviceProvider: 'Google',
                cookies: [
                    {
                        name: '_gcl_au',
                        duration: 3,
                        unit: 'months' as const,
                        purpose: {
                            deDE: 'Wird für die Personalisierung von Werbung verwendet',
                            enUS: 'Used for ad personalization'
                        }
                    }
                ]
            }
        ],
        ...(process.env.NEXT_PUBLIC_STATIC_DEMO !== 'true'
            ? {
                  integrations: [
                      {
                          id: 'int_ga4',
                          type: 'ga4' as const,
                          providerId: 'google_analytics',
                          params: { measurementId: 'G-XXXXXXXXXX' }
                      }
                  ]
              }
            : {})
    }

    return (
        <CookieConsentProvider config={config} key={themeKey}>
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex flex-col">
                <SiteHeader />

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{h.heroTitle}</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{h.heroSubtitle}</p>
                        </div>

                        <LicenseNotice />

                        {/* Theme Customization Card */}
                        <Card className="border-2">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-teal-600" />
                                    <CardTitle>{h.themeCard.title}</CardTitle>
                                </div>
                                <CardDescription>{h.themeCard.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Two column layout: Themes + Colors on left, Preview on right */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Left side: Theme selection */}
                                    <div className="space-y-6">
                                        {/* Preset themes with visual swatches */}
                                        <div>
                                            <p className="text-sm font-medium mb-4 block text-slate-700">
                                                {h.themeCard.presetThemes}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(presetThemes).map(([preset, theme]) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() => handlePresetChange(preset)}
                                                        className={`group relative p-4 rounded-xl border-2 transition-all text-left ${
                                                            JSON.stringify(customTheme) === JSON.stringify(theme)
                                                                ? 'border-blue-500 ring-2 ring-blue-100'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div
                                                                className="w-8 h-8 rounded-lg shadow-sm"
                                                                style={{
                                                                    backgroundColor: theme.bgPrimary,
                                                                    border:
                                                                        theme.bgPrimary === '#ffffff' ||
                                                                        theme.bgPrimary === '#fffbeb' ||
                                                                        theme.bgPrimary === '#fafafa'
                                                                            ? '1px solid #e2e8f0'
                                                                            : 'none'
                                                                }}
                                                            />
                                                            <div
                                                                className="w-8 h-8 rounded-lg shadow-sm"
                                                                style={{ backgroundColor: theme.primaryColor }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {presetLabels[preset] ?? preset}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Custom color inputs - cleaner layout */}
                                        <div>
                                            <p className="text-sm font-medium mb-4 block text-slate-700">
                                                {h.themeCard.fineTuneColors}
                                            </p>
                                            <div className="space-y-3">
                                                {(Object.keys(customTheme) as (keyof CookieConsentStyle)[]).map(
                                                    colorKey => (
                                                        <div key={colorKey} className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <input
                                                                    type="color"
                                                                    id={colorKey}
                                                                    value={customTheme[colorKey]}
                                                                    onChange={e => {
                                                                        const normalized = normalizeHexColor(
                                                                            e.target.value
                                                                        )
                                                                        handleColorChange(colorKey, normalized)
                                                                    }}
                                                                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors"
                                                                    style={{ padding: 0 }}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label
                                                                    htmlFor={colorKey}
                                                                    className="text-sm font-medium text-slate-600 block"
                                                                >
                                                                    {colorLabels[colorKey]}
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={customTheme[colorKey]}
                                                                onChange={e => {
                                                                    const value = e.target.value
                                                                    if (
                                                                        value === '' ||
                                                                        /^#?[0-9A-Fa-f]{0,6}$/i.test(value)
                                                                    ) {
                                                                        handleColorChange(colorKey, value)
                                                                    }
                                                                }}
                                                                onBlur={e => {
                                                                    const normalized = normalizeHexColor(e.target.value)
                                                                    handleColorChange(colorKey, normalized)
                                                                }}
                                                                className="w-24 text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Live preview */}
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-slate-700 block">
                                            {h.themeCard.livePreview}
                                        </p>
                                        <div className="bg-slate-100 rounded-2xl p-6 min-h-[320px] flex items-end justify-center">
                                            {/* Banner preview - matches actual component */}
                                            <div
                                                className="w-full max-w-md rounded-xl overflow-hidden"
                                                style={{
                                                    backgroundColor: customTheme.bgPrimary,
                                                    boxShadow:
                                                        '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)'
                                                }}
                                            >
                                                <div className="p-4">
                                                    <div className="mb-3">
                                                        <h3
                                                            className="text-base font-semibold mb-1"
                                                            style={{ color: customTheme.textPrimary }}
                                                        >
                                                            {h.themeCard.preview.title}
                                                        </h3>
                                                        <p
                                                            className="text-xs leading-relaxed"
                                                            style={{ color: customTheme.textSecondary }}
                                                        >
                                                            {h.themeCard.preview.body}{' '}
                                                            <span
                                                                style={{
                                                                    color: customTheme.primaryColor,
                                                                    textDecoration: 'underline'
                                                                }}
                                                            >
                                                                {h.themeCard.preview.learnMore}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                                                            style={{
                                                                color: customTheme.textSecondary,
                                                                backgroundColor: 'transparent'
                                                            }}
                                                        >
                                                            {h.themeCard.preview.details}
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                                                                style={{
                                                                    color: customTheme.textPrimary,
                                                                    border: `1px solid ${customTheme.textPrimary}25`,
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                            >
                                                                {h.themeCard.preview.essentialOnly}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                                                                style={{
                                                                    color: customTheme.buttonText,
                                                                    backgroundColor: customTheme.primaryColor
                                                                }}
                                                            >
                                                                {h.themeCard.preview.acceptAll}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <OpenBannerButton label={h.openCookieSettings} />
                                            <p className="text-xs text-slate-500">{h.themeCard.testRealComponent}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-teal-600" />
                                    <CardTitle>{h.consentGate.title}</CardTitle>
                                </div>
                                <CardDescription className="max-w-2xl">
                                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
                                        CookieConsentGate
                                    </code>{' '}
                                    {h.consentGate.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 leading-relaxed">
                                    {h.consentGate.demoContext}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {h.consentGate.liveDemo}
                                    </p>
                                    <StripeCheckoutConsentGateDemo
                                        paymentPossible={h.consentGate.paymentPossible}
                                        paymentDescription={h.consentGate.paymentDescription}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                                    <CardTitle>{h.features.gdpr.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{h.features.gdpr.description}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                                    <CardTitle>{h.features.integration.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {h.features.integration.description}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Globe className="h-8 w-8 text-blue-600 mb-2" />
                                    <CardTitle>{h.features.multilingual.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {h.features.multilingual.description}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Palette className="h-8 w-8 text-purple-600 mb-2" />
                                    <CardTitle>{h.features.customizable.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {h.features.customizable.description}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Shield className="h-8 w-8 text-teal-600 mb-2" />
                                    <CardTitle>{h.features.gates.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{h.features.gates.description}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Settings2 className="h-8 w-8 text-slate-600 mb-2" />
                                    <CardTitle>{h.features.granular.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{h.features.granular.description}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle>{h.gettingStarted.title}</CardTitle>
                                <CardDescription>{h.gettingStarted.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ol className="m-0 list-none space-y-5 p-0">
                                    {h.gettingStarted.steps.map((step, index) => (
                                        <li key={step.title} className="flex gap-4">
                                            <Badge
                                                variant="outline"
                                                className="mt-0.5 h-7 w-7 shrink-0 justify-center rounded-full p-0 text-sm"
                                            >
                                                {index + 1}
                                            </Badge>
                                            <div className="min-w-0 space-y-1">
                                                <h4 className="font-semibold leading-tight text-slate-900">
                                                    {step.title}
                                                </h4>
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </CookieConsentProvider>
    )
}
