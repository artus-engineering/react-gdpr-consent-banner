import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'prismjs/themes/prism-tomorrow.css'
import {
    CookieConsentBanner,
    CookieConsentBannerConfig,
    CookieConsentGate,
    CookieConsentProvider,
    CookiePolicy,
    SupportedLanguage,
    createGranularGoogleTagManagerHook
} from '../src'
import { ConsentStateProviderContext } from '../src/components/consent/context'
import { WebsiteCookieProvider } from './config'

const Example: React.FC<{}> = () => {
    const [language, setLanguage] = useState<SupportedLanguage>('enUS')

    const config: CookieConsentBannerConfig = {
        theme: {
            bgPrimary: '#ffffff',
            bgSecondary: '#e2e8f0',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            primaryColor: '#0984e3',
            buttonText: '#ffffff'
        },
        lang: language,
        websiteName: 'React GDPR Cookie Consent Demo',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'localhost',
        providers: [
            // Essential cookies for website functionality
            WebsiteCookieProvider,

            // Google Analytics Storage (analytics_storage parameter)
            {
                id: 'google-analytics-storage',
                name: 'Google Analytics Storage',
                serviceProvider: 'Google',
                category: 'Analytics',
                description: {
                    enUS: 'Allows Google Analytics to store data like user sessions and page views for website analysis.',
                    deDE: 'Ermöglicht Google Analytics das Speichern von Daten wie Benutzersitzungen und Seitenaufrufen für die Website-Analyse.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    {
                        name: '_ga',
                        duration: 2,
                        unit: 'years',
                        purpose: { enUS: 'Distinguish unique users for analytics', deDE: 'Unterscheidet eindeutige Benutzer für Analysen' }
                    },
                    {
                        name: '_gid',
                        duration: 1,
                        unit: 'days',
                        purpose: { enUS: 'Distinguish unique users for analytics', deDE: 'Unterscheidet eindeutige Benutzer für Analysen' }
                    },
                    { name: '_ga_*', duration: 2, unit: 'years', purpose: { enUS: 'Store and count pageviews for GA4', deDE: 'Speichert und zählt Seitenaufrufe für GA4' } }
                ]
            },

            // Google Ad Storage (ad_storage parameter)
            {
                id: 'google-ad-storage',
                name: 'Google Ad Storage',
                serviceProvider: 'Google',
                category: 'Marketing',
                description: {
                    enUS: 'Allows Google to store advertising-related data like conversion tracking and attribution.',
                    deDE: 'Ermöglicht Google das Speichern von Werbe-bezogenen Daten wie Konversionsverfolgung und Zuschreibung.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '_gcl_*', duration: 90, unit: 'days', purpose: { enUS: 'Conversion tracking and attribution', deDE: 'Konversionsverfolgung und Zuschreibung' } },
                    {
                        name: '_gac_*',
                        duration: 90,
                        unit: 'days',
                        purpose: { enUS: 'Google Ads cookie for conversion tracking', deDE: 'Google Ads-Cookie für Konversionsverfolgung' }
                    },
                    { name: '_gat_*', duration: 1, unit: 'days', purpose: { enUS: 'Used to throttle request rate', deDE: 'Wird verwendet, um die Anforderungsrate zu begrenzen' } }
                ]
            },

            // Google Ad User Data (ad_user_data parameter)
            {
                id: 'google-ad-user-data',
                name: 'Google Ad User Data',
                serviceProvider: 'Google',
                category: 'Marketing',
                description: {
                    enUS: 'Allows Google to use your data for advertising purposes like improving ad targeting.',
                    deDE: 'Ermöglicht Google, Ihre Daten für Werbezwecke wie die Verbesserung der Werbung zu verwenden.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [{ name: '_gid', duration: 1, unit: 'days', purpose: { enUS: 'User identification for ad targeting', deDE: 'Benutzeridentifikation für Werbung' } }]
            },

            // Google Ad Personalization (ad_personalization parameter)
            {
                id: 'google-ad-personalization',
                name: 'Google Ad Personalization',
                serviceProvider: 'Google',
                category: 'Marketing',
                description: {
                    enUS: 'Allows Google to show you personalized ads based on your interests and browsing behavior.',
                    deDE: 'Ermöglicht Google, Ihnen personalisierte Werbung basierend auf Ihren Interessen und Surfverhalten anzuzeigen.'
                },
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '__gads', duration: 2, unit: 'years', purpose: { enUS: 'Personalized advertising', deDE: 'Persönliche Werbung' } },
                    { name: '__gpi', duration: 2, unit: 'years', purpose: { enUS: 'Personalized advertising identifier', deDE: 'Persönliche Werbung-Identifikator' } }
                ]
            }
        ],

        // ✅ Granular Google Tag Manager with individual consent parameter control
        consentHooks: createGranularGoogleTagManagerHook('GTM-DEMO123') // Replace with your GTM ID
    }

    return (
        <React.StrictMode>
            <CookieConsentProvider config={config}>
                <div className="min-h-screen bg-slate-50 p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-slate-800 mb-4">React GDPR Cookie Consent</h1>
                            <p className="text-xl text-slate-600">A comprehensive cookie consent solution for React applications</p>
                        </div>

                        {/* Features List */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Features</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-3">Core Features</h3>
                                    <ul className="text-slate-700 space-y-2">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Category-based consent
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Conditional content rendering
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Automatic policy generation
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Google Tag Manager + Consent Mode v2
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-3">Customization</h3>
                                    <ul className="text-slate-700 space-y-2">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Custom themes
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Multi-language support
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Flexible provider config
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Cross-domain consent
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-3">Compliance</h3>
                                    <ul className="text-slate-700 space-y-2">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            GDPR compliant
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            CCPA ready
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            Accessible design
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                                            SEO friendly
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Language</h2>
                            <select
                                className="border border-slate-300 rounded-lg p-3 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={language}
                                onChange={e => setLanguage(e.currentTarget.value as SupportedLanguage)}
                            >
                                <option value="enUS">English</option>
                                <option value="deDE">Deutsch</option>
                            </select>
                        </div>

                        {/* Features Grid */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Cookie Banner */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cookie Banner</h2>
                                <p className="text-slate-600 mb-4">The main consent banner that appears to users.</p>
                                <BannerButton />
                            </div>

                            {/* Consent Gate */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Consent Gate</h2>
                                <p className="text-slate-600 mb-4">Conditionally render content based on consent.</p>

                                <CookieConsentGate
                                    cookieProvider={{
                                        id: 'google-analytics-gtm',
                                        name: 'Google Analytics (via GTM)',
                                        category: 'Analytics',
                                        description: 'Analytics tracking through GTM',
                                        dataProtectionLink: 'https://policies.google.com/privacy',
                                        cookies: []
                                    }}
                                >
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-emerald-800">✅ Analytics Active</h3>
                                        <p className="text-emerald-700">This content is only visible if Analytics consent is given through GTM.</p>
                                    </div>
                                </CookieConsentGate>
                            </div>

                            {/* Cookie Policy */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cookie Policy</h2>
                                <p className="text-slate-600 mb-4">Automatically generated cookie policy.</p>
                                <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <CookiePolicy />
                                </div>
                            </div>

                            {/* Google Tag Manager */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Google Tag Manager Integration</h2>
                                <p className="text-slate-600 mb-4">Proper GTM implementation with Google Consent Mode v2 - loads with default DENIED consent.</p>
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-blue-800 text-sm mb-1">🔒 Correct Implementation:</h4>
                                        <p className="text-blue-700 text-sm">GTM loads immediately but with ALL consent DENIED by default. Users must explicitly grant consent.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-800 text-sm mb-1">🎯 Individual Consent Parameters:</h4>
                                        <p className="text-green-700 text-sm">
                                            Each Google consent parameter can be controlled individually:
                                            <strong>analytics_storage</strong>, <strong>ad_storage</strong>, <strong>ad_user_data</strong>, <strong>ad_personalization</strong>
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-800 text-sm mb-1">🎯 Test Granular Consent:</h4>
                                        <p className="text-purple-700 text-sm">
                                            Check individual providers in the banner and watch
                                            <code className="bg-white px-1 rounded ml-1">analytics_storage_granted</code>,
                                            <code className="bg-white px-1 rounded ml-1">ad_storage_granted</code> events in console.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-orange-800 text-sm mb-1">⚠️ GDPR Compliance:</h4>
                                        <p className="text-orange-700 text-sm">No tracking cookies are set until explicit user consent is given for each category.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner - always rendered but controlled by context */}
                <CookieConsentBanner />
            </CookieConsentProvider>
        </React.StrictMode>
    )
}

// Component to handle banner button
function BannerButton() {
    const context = React.useContext(ConsentStateProviderContext)

    const resetConsent = () => {
        // Clear the consent cookie to allow the banner to show again
        document.cookie = 'cookie_consent_displayed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        // Reload the page to reset the state
        window.location.reload()
    }

    return (
        <div className="flex gap-2">
            <button type="button" onClick={() => context?.openBanner()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Show Banner
            </button>
            <button type="button" onClick={resetConsent} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Reset Consent
            </button>
        </div>
    )
}

const container = document.getElementById('root')
if (!container) {
    throw new Error('Root container not found')
}

createRoot(container).render(<Example />)
