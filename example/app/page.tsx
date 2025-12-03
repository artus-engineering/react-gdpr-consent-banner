'use client'

import { CheckCircle2, Globe, Palette, Settings2, Shield, Zap } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CookieConsentProvider } from '../../src/components/consent'
import { createGoogleAnalyticsHook } from '../../src/consentHooks'
import { useCookieConsentContext } from '../../src/hooks'
import { CookieConsentStyle } from '../../src/types'
import { generateUserId, getUserIdFromClientCookies } from '../lib/userId'

// Component to open the banner (must be inside CookieConsentProvider)
function OpenBannerButton() {
    const { setIsBannerOpen } = useCookieConsentContext()

    return (
        <Button onClick={() => setIsBannerOpen(true)} size="lg">
            <Settings2 className="mr-2 h-4 w-4" />
            Cookie-Einstellungen öffnen
        </Button>
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

const colorLabels: Record<keyof CookieConsentStyle, string> = {
    bgPrimary: 'Background',
    bgSecondary: 'Secondary BG',
    textPrimary: 'Text Primary',
    textSecondary: 'Text Secondary',
    primaryColor: 'Accent Color',
    buttonText: 'Button Text'
}

export default function HomePage() {
    const [customTheme, setCustomTheme] = useState<CookieConsentStyle>(presetThemes.light)
    const [themeKey, setThemeKey] = useState(0)

    const getUserId = () => {
        return getUserIdFromClientCookies() || generateUserId()
    }

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

    const config = {
        cookiePolicyLink: '/privacy-policy',
        websiteName: 'Example Website',
        domain: 'localhost',
        crossSubDomainConsent: ['tebuto.de', 'app.tebuto.de', 'termin.tebuto.de', 'link.tebuto.de'],
        cookiesValidForDays: 365,
        lang: 'deDE' as const,
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
        audit: {
            url: '/api/gdpr/audit',
            userId: getUserId(),
            additionalData: {
                source: 'nextjs-example',
                version: '1.0.0'
            }
        },
        consentHooks: createGoogleAnalyticsHook('GA_MEASUREMENT_ID', {
            anonymizeIp: true,
            cookieFlags: 'SameSite=Strict;Secure'
        })
    }

    return (
        <CookieConsentProvider config={config} key={themeKey}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-teal-600" />
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">GDPR Cookie Consent</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Hero Section */}
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">World-Class Cookie Consent</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                A beautifully designed, GDPR-compliant cookie consent system with full customization and audit trail capabilities.
                            </p>
                        </div>

                        {/* Theme Customization Card */}
                        <Card className="border-2">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-teal-600" />
                                    <CardTitle>Theme Customization</CardTitle>
                                </div>
                                <CardDescription>Customize the appearance of your cookie consent banner with live preview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Two column layout: Themes + Colors on left, Preview on right */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Left side: Theme selection */}
                                    <div className="space-y-6">
                                        {/* Preset themes with visual swatches */}
                                        <div>
                                            <label className="text-sm font-medium mb-4 block text-slate-700">Preset Themes</label>
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
                                                                        theme.bgPrimary === '#ffffff' || theme.bgPrimary === '#fffbeb' || theme.bgPrimary === '#fafafa'
                                                                            ? '1px solid #e2e8f0'
                                                                            : 'none'
                                                                }}
                                                            />
                                                            <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: theme.primaryColor }} />
                                                        </div>
                                                        <span className="text-sm font-medium capitalize text-slate-700">{preset}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Custom color inputs - cleaner layout */}
                                        <div>
                                            <label className="text-sm font-medium mb-4 block text-slate-700">Fine-tune Colors</label>
                                            <div className="space-y-3">
                                                {(Object.keys(customTheme) as (keyof CookieConsentStyle)[]).map(colorKey => (
                                                    <div key={colorKey} className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <input
                                                                type="color"
                                                                id={colorKey}
                                                                value={customTheme[colorKey]}
                                                                onChange={e => {
                                                                    const normalized = normalizeHexColor(e.target.value)
                                                                    handleColorChange(colorKey, normalized)
                                                                }}
                                                                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 hover:border-slate-400 transition-colors"
                                                                style={{ padding: 0 }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label htmlFor={colorKey} className="text-sm font-medium text-slate-600 block">
                                                                {colorLabels[colorKey]}
                                                            </label>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={customTheme[colorKey]}
                                                            onChange={e => {
                                                                const value = e.target.value
                                                                if (value === '' || /^#?[0-9A-Fa-f]{0,6}$/i.test(value)) {
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
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Live preview */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-slate-700 block">Live Preview</label>
                                        <div className="bg-slate-100 rounded-2xl p-6 min-h-[320px] flex items-end justify-center">
                                            {/* Banner preview - matches actual component */}
                                            <div
                                                className="w-full max-w-md rounded-xl overflow-hidden"
                                                style={{
                                                    backgroundColor: customTheme.bgPrimary,
                                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)'
                                                }}
                                            >
                                                <div className="p-4">
                                                    <div className="mb-3">
                                                        <h3 className="text-base font-semibold mb-1" style={{ color: customTheme.textPrimary }}>
                                                            Wir schätzen Ihre Privatsphäre
                                                        </h3>
                                                        <p className="text-xs leading-relaxed" style={{ color: customTheme.textSecondary }}>
                                                            Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.{' '}
                                                            <span style={{ color: customTheme.primaryColor, textDecoration: 'underline' }}>Mehr erfahren</span>
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
                                                            Details
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
                                                                Nur Notwendige
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                                                                style={{
                                                                    color: customTheme.buttonText,
                                                                    backgroundColor: customTheme.primaryColor
                                                                }}
                                                            >
                                                                Alle Akzeptieren
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <OpenBannerButton />
                                            <p className="text-xs text-slate-500">Test with the real component</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                                    <CardTitle>GDPR Compliant</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Fully compliant with GDPR, CCPA, and other privacy regulations. Complete audit trail for all consent changes.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                                    <CardTitle>Easy Integration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Simple configuration with pre-built hooks for Google Analytics, PostHog, Matomo, and more. Just add your IDs.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Globe className="h-8 w-8 text-blue-600 mb-2" />
                                    <CardTitle>Multi-Language</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Built-in German and English translations. Easily extensible for any language with i18n support.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Palette className="h-8 w-8 text-purple-600 mb-2" />
                                    <CardTitle>Fully Customizable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Complete control over colors, typography, and layout. Match your brand identity perfectly.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Shield className="h-8 w-8 text-teal-600 mb-2" />
                                    <CardTitle>Consent Gates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Block content until consent is given. Perfect for embedded videos, maps, and third-party widgets.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Settings2 className="h-8 w-8 text-slate-600 mb-2" />
                                    <CardTitle>Multi-Step Consent</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Support for granular consent levels. Essential, Functional, Analytics, and Marketing categories.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Getting Started</CardTitle>
                                <CardDescription>Learn how to integrate and customize the cookie consent banner</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Badge variant="outline">1</Badge>
                                        Customize Your Theme
                                    </h4>
                                    <p className="text-sm text-muted-foreground ml-8">
                                        Use the color pickers above to customize the banner appearance. Changes update in real-time.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Badge variant="outline">2</Badge>
                                        Configure Providers
                                    </h4>
                                    <p className="text-sm text-muted-foreground ml-8">Add your cookie providers with descriptions, privacy links, and cookie details.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Badge variant="outline">3</Badge>
                                        Test the Banner
                                    </h4>
                                    <p className="text-sm text-muted-foreground ml-8">
                                        Click &quot;Cookie-Einstellungen öffnen&quot; to see the full banner with all customization options.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </CookieConsentProvider>
    )
}
